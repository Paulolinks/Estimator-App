import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para item
const createItemSchema = z.object({
  orgId: z.string().min(1, 'Organization ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sku: z.string().optional(),
  priceCents: z.number().min(0),
  costCents: z.number().min(0).nullable().default(0).transform(val => val ?? 0),
  category: z.string().optional(),
  unit: z.string().default('each'),
  taxable: z.boolean().default(true),
  active: z.boolean().default(true),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = createItemSchema.parse(body)

    // Criar item
    const item = await prisma.item.create({
      data: {
        orgId: validatedData.orgId,
        name: validatedData.name,
        description: validatedData.description,
        sku: validatedData.sku,
        priceCents: validatedData.priceCents,
        costCents: validatedData.costCents,
        category: validatedData.category,
        unit: validatedData.unit,
        taxable: validatedData.taxable,
        active: validatedData.active,
        notes: validatedData.notes
      }
    })

    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('Error creating item:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (!orgId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Organization ID é obrigatório' 
        },
        { status: 400 }
      )
    }

    // Construir filtros
    const where: any = { orgId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar itens
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.item.count({ where })
    ])

    // Formatar preços
    const formattedItems = items.map((item: any) => ({
      ...item,
      price: (item.priceCents / 100).toFixed(2),
      cost: (item.costCents / 100).toFixed(2)
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar itens' 
      },
      { status: 500 }
    )
  }
}