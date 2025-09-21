import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateItemSchema = z.object({
  name: z.string().min(1, 'Nome do item é obrigatório').optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero').optional(),
  cost: z.number().min(0, 'Custo deve ser maior ou igual a zero').optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  taxable: z.boolean().optional(),
  active: z.boolean().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        organization: true
      }
    })

    if (!item) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Item não encontrado' 
        },
        { status: 404 }
      )
    }

    // Converter preços de centavos para reais
    const itemWithFormattedPrices = {
      ...item,
      price: item.priceCents / 100,
      cost: item.costCents / 100
    }

    return NextResponse.json({
      success: true,
      data: itemWithFormattedPrices
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar item' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)

    // Verificar se item existe
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Item não encontrado' 
        },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData }
    if (validatedData.price !== undefined) {
      updateData.priceCents = Math.round(validatedData.price * 100)
      delete updateData.price
    }
    if (validatedData.cost !== undefined) {
      updateData.costCents = Math.round(validatedData.cost * 100)
      delete updateData.cost
    }

    // Atualizar item
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
      include: {
        organization: true
      }
    })

    // Converter preços de centavos para reais
    const itemWithFormattedPrices = {
      ...updatedItem,
      price: updatedItem.priceCents / 100,
      cost: updatedItem.costCents / 100
    }

    return NextResponse.json({
      success: true,
      data: itemWithFormattedPrices
    })
  } catch (error) {
    console.error('Error updating item:', error)
    
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
        error: 'Erro ao atualizar item' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    // Verificar se item existe
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Item não encontrado' 
        },
        { status: 404 }
      )
    }

    // Deletar item
    await prisma.item.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: 'Item deletado com sucesso'
    })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao deletar item' 
      },
      { status: 500 }
    )
  }
}
