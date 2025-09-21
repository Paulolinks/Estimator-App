import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para expense
const createExpenseSchema = z.object({
  orgId: z.string().min(1, 'Organization ID é obrigatório'),
  merchant: z.string().min(1, 'Merchant é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  category: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  receiptUrl: z.string().url('URL do recibo inválida').optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = createExpenseSchema.parse(body)
    
    // Criar expense
    const expense = await prisma.expense.create({
      data: {
        orgId: validatedData.orgId,
        merchant: validatedData.merchant,
        description: validatedData.description,
        amountCents: Math.round(validatedData.amount * 100),
        category: validatedData.category,
        date: new Date(validatedData.date),
        receiptUrl: validatedData.receiptUrl,
        notes: validatedData.notes
      },
      include: {
        organization: true
      }
    })

    // Converter valor de centavos para reais
    const expenseWithFormattedAmount = {
      ...expense,
      amount: expense.amountCents / 100
    }

    return NextResponse.json({
      success: true,
      data: expenseWithFormattedAmount
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    
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
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
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
        { merchant: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (category) {
      where.category = category
    }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Buscar expenses
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ])

    // Converter valores de centavos para reais
    const expensesWithFormattedAmounts = expenses.map(expense => ({
      ...expense,
      amount: expense.amountCents / 100
    }))

    // Calcular total
    const totalAmount = await prisma.expense.aggregate({
      where,
      _sum: { amountCents: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        expenses: expensesWithFormattedAmounts,
        totalAmount: totalAmount._sum.amountCents ? totalAmount._sum.amountCents / 100 : 0,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar despesas' 
      },
      { status: 500 }
    )
  }
}
