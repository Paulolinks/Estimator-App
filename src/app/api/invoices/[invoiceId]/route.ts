import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Número da fatura é obrigatório').optional(),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  subtotalCents: z.number().min(0, 'Subtotal deve ser maior ou igual a zero').optional(),
  taxCents: z.number().min(0, 'Taxa deve ser maior ou igual a zero').optional(),
  discountCents: z.number().min(0, 'Desconto deve ser maior ou igual a zero').optional(),
  totalCents: z.number().min(0, 'Total deve ser maior ou igual a zero').optional(),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    id: z.string().optional(), // Para updates
    description: z.string().min(1, 'Descrição é obrigatória'),
    additionalDetails: z.string().optional(),
    quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
    unitCents: z.number().min(0, 'Preço unitário deve ser maior ou igual a zero'),
    amountCents: z.number().min(0, 'Valor deve ser maior ou igual a zero')
  })).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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

    if (!invoice) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Fatura não encontrada' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar fatura' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params
    const body = await request.json()
    const validatedData = updateInvoiceSchema.parse(body)

    // Verificar se invoice existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Fatura não encontrada' 
        },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData }
    if (validatedData.invoiceDate) {
      updateData.invoiceDate = new Date(validatedData.invoiceDate)
    }
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate)
    }

    // Se lineItems foram fornecidos, atualizar
    if (validatedData.lineItems) {
      // Deletar lineItems existentes
      await prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: invoiceId }
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

    // Atualizar invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        customer: true,
        lineItems: true,
        organization: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedInvoice
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    
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
        error: 'Erro ao atualizar fatura' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params
    // Verificar se invoice existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Fatura não encontrada' 
        },
        { status: 404 }
      )
    }

    // Verificar se invoice já foi paga
    if (existingInvoice.status === 'paid') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível deletar fatura já paga' 
        },
        { status: 400 }
      )
    }

    // Deletar invoice (cascade deleta lineItems)
    await prisma.invoice.delete({
      where: { id: invoiceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Fatura deletada com sucesso'
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao deletar fatura' 
      },
      { status: 500 }
    )
  }
}
