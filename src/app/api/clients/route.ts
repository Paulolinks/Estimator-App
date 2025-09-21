import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para cliente
const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('Website inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
  orgId: z.string().min(1, 'Organization ID é obrigatório')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = createClientSchema.parse(body)
    
    // Criar cliente
    const client = await prisma.customer.create({
      data: {
        orgId: validatedData.orgId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        // Adicionar outros campos conforme necessário
      },
      include: {
        organization: true
      }
    })

    return NextResponse.json({
      success: true,
      data: client
    })
  } catch (error) {
    console.error('Error creating client:', error)
    
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
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar clientes
    const [clients, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              estimates: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.customer.count({ where })
    ])

    // Calcular total billed para cada cliente
    const clientsWithTotalBilled = await Promise.all(
      clients.map(async (client) => {
        const totalBilled = await prisma.estimate.aggregate({
          where: { 
            customerId: client.id,
            status: 'accepted'
          },
          _sum: { totalCents: true }
        })

        return {
          ...client,
          totalBilled: totalBilled._sum.totalCents || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        clients: clientsWithTotalBilled,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar clientes' 
      },
      { status: 500 }
    )
  }
}
