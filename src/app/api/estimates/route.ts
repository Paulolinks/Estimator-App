import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para estimativa
const createEstimateSchema = z.object({
  orgId: z.string().min(1, 'Organization ID é obrigatório'),
  customerId: z.string().min(1, 'Customer ID é obrigatório'),
  estimateDate: z.string().transform(str => new Date(str)),
  validUntil: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
  subtotalCents: z.number().min(0),
  taxCents: z.number().min(0).default(0),
  totalCents: z.number().min(0),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description é obrigatória'),
    additionalDetails: z.string().optional(),
    quantity: z.number().min(1),
    unitCents: z.number().min(0),
    amountCents: z.number().min(0)
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = createEstimateSchema.parse(body)

    // Gerar número da estimativa
    const count = await prisma.estimate.count({
      where: { orgId: validatedData.orgId }
    })
    const estimateNumber = `EST-${String(count + 1).padStart(3, '0')}`

    // Criar estimativa
    const estimate = await prisma.estimate.create({
      data: {
        orgId: validatedData.orgId,
        customerId: validatedData.customerId,
        estimateNumber,
        estimateDate: validatedData.estimateDate,
        validUntil: validatedData.validUntil,
        status: 'draft',
        subtotalCents: validatedData.subtotalCents,
        taxCents: validatedData.taxCents,
        totalCents: validatedData.totalCents,
        notes: validatedData.notes,
        lineItems: {
          create: validatedData.lineItems.map(item => ({
            description: item.description,
            additionalDetails: item.additionalDetails,
            quantity: item.quantity,
            unitCents: item.unitCents,
            amountCents: item.amountCents
          }))
        }
      },
      include: {
        customer: true,
        lineItems: true
      }
    })

    return NextResponse.json({
      success: true,
      data: estimate
    })
  } catch (error) {
    console.error('Error creating estimate:', error)
    
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
        { estimateNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Buscar estimativas
    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        include: {
          customer: true,
          lineItems: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.estimate.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        estimates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching estimates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar estimativas' 
      },
      { status: 500 }
    )
  }
}