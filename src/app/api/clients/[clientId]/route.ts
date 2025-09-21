import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('Website inválido').optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const client = await prisma.customer.findUnique({
      where: { id: clientId },
      include: {
        organization: true,
        estimates: {
          include: {
            lineItems: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cliente não encontrado' 
        },
        { status: 404 }
      )
    }

    // Calcular estatísticas do cliente
    const stats = await prisma.estimate.aggregate({
      where: { customerId: clientId },
      _sum: {
        totalCents: true
      },
      _count: true
    })

    const acceptedStats = await prisma.estimate.aggregate({
      where: { 
        customerId: clientId,
        status: 'accepted'
      },
      _sum: {
        totalCents: true
      },
      _count: true
    })

    return NextResponse.json({
      success: true,
      data: {
        ...client,
        stats: {
          totalEstimates: stats._count,
          totalValue: stats._sum.totalCents || 0,
          acceptedEstimates: acceptedStats._count,
          acceptedValue: acceptedStats._sum.totalCents || 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar cliente' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const body = await request.json()
    const validatedData = updateClientSchema.parse(body)

    // Verificar se cliente existe
    const existingClient = await prisma.customer.findUnique({
      where: { id: clientId }
    })

    if (!existingClient) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cliente não encontrado' 
        },
        { status: 404 }
      )
    }

    // Atualizar cliente
    const updatedClient = await prisma.customer.update({
      where: { id: clientId },
      data: validatedData,
      include: {
        organization: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedClient
    })
  } catch (error) {
    console.error('Error updating client:', error)
    
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
        error: 'Erro ao atualizar cliente' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    // Verificar se cliente existe
    const existingClient = await prisma.customer.findUnique({
      where: { id: clientId },
      include: {
        estimates: true
      }
    })

    if (!existingClient) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cliente não encontrado' 
        },
        { status: 404 }
      )
    }

    // Verificar se cliente tem orçamentos
    if (existingClient.estimates.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível deletar cliente com orçamentos associados' 
        },
        { status: 400 }
      )
    }

    // Deletar cliente
    await prisma.customer.delete({
      where: { id: clientId }
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao deletar cliente' 
      },
      { status: 500 }
    )
  }
}
