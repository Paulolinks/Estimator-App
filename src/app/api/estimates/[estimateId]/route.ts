import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEstimateSchema = z.object({
  customerId: z.string().optional(),
  estimateDate: z.string().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  subtotalCents: z.number().min(0).optional(),
  taxCents: z.number().min(0).optional(),
  discountCents: z.number().min(0).optional(),
  totalCents: z.number().min(0).optional(),
  status: z.string().optional(),
  lineItems: z.array(z.object({
    id: z.string().optional(),
    description: z.string().min(1, 'Descrição é obrigatória'),
    additionalDetails: z.string().optional(),
    quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
    unitCents: z.number().min(0, 'Preço unitário deve ser maior ou igual a zero'),
    amountCents: z.number().min(0, 'Valor deve ser maior ou igual a zero')
  })).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const { estimateId } = await params
    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        customer: true,
        lineItems: true,
        organization: {
          include: {
            settings: true
          }
        }
      }
    })

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: estimate })
  } catch (error) {
    console.error('Error fetching estimate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch estimate' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const { estimateId } = await params
    const body = await request.json()
    const validatedData = updateEstimateSchema.parse(body)
    
    // Verificar se estimate existe
    const existingEstimate = await prisma.estimate.findUnique({
      where: { id: estimateId }
    })

    if (!existingEstimate) {
      return NextResponse.json(
        { success: false, error: 'Estimate not found' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (validatedData.customerId !== undefined) updateData.customerId = validatedData.customerId
    if (validatedData.estimateDate !== undefined) updateData.estimateDate = new Date(validatedData.estimateDate)
    if (validatedData.validUntil !== undefined) updateData.validUntil = new Date(validatedData.validUntil)
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.subtotalCents !== undefined) updateData.subtotalCents = validatedData.subtotalCents
    if (validatedData.taxCents !== undefined) updateData.taxCents = validatedData.taxCents
    if (validatedData.discountCents !== undefined) updateData.discountCents = validatedData.discountCents
    if (validatedData.totalCents !== undefined) updateData.totalCents = validatedData.totalCents
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    // Se lineItems foram fornecidos, atualizar
    if (validatedData.lineItems) {
      // Deletar lineItems existentes
      await prisma.lineItem.deleteMany({
        where: { estimateId: estimateId }
      })

      // Criar novos lineItems
      updateData.lineItems = {
        create: validatedData.lineItems.map((item: any) => ({
          description: item.description,
          additionalDetails: item.additionalDetails,
          quantity: item.quantity,
          unitCents: item.unitCents,
          amountCents: item.amountCents
        }))
      }
    }

    const estimate = await prisma.estimate.update({
      where: { id: estimateId },
      data: updateData,
      include: {
        lineItems: true,
        customer: true,
        organization: true
      }
    })

    return NextResponse.json({ success: true, data: estimate })
  } catch (error) {
    console.error('Error updating estimate:', error)
    
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
      { success: false, error: 'Failed to update estimate' },
      { status: 500 }
    )
  }
}
