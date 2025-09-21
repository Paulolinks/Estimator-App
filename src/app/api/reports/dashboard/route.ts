import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Organization ID é obrigatório' 
        },
        { status: 400 }
      )
    }

    // Estatísticas gerais
    const [
      totalInvoices,
      openEstimates,
      paidInvoices,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalClients,
      totalItems
    ] = await Promise.all([
      // Total de invoices
      prisma.invoice.count({
        where: { orgId }
      }),
      
      // Orçamentos em aberto
      prisma.estimate.count({
        where: { 
          orgId,
          status: { in: ['draft', 'sent'] }
        }
      }),
      
      // Invoices pagos
      prisma.invoice.count({
        where: { 
          orgId,
          status: 'paid'
        }
      }),
      
      // Receita total
      prisma.invoice.aggregate({
        where: { 
          orgId,
          status: 'paid'
        },
        _sum: { totalCents: true }
      }),
      
      // Receita deste mês
      prisma.invoice.aggregate({
        where: { 
          orgId,
          status: 'paid',
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { totalCents: true }
      }),
      
      // Receita do mês passado
      prisma.invoice.aggregate({
        where: { 
          orgId,
          status: 'paid',
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { totalCents: true }
      }),
      
      // Total de clientes
      prisma.customer.count({
        where: { orgId }
      }),
      
      // Total de itens
      prisma.item.count({
        where: { 
          orgId,
          active: true
        }
      })
    ])

    // Receitas pendentes
    const pendingRevenue = await prisma.invoice.aggregate({
      where: { 
        orgId,
        status: { in: ['sent', 'overdue'] }
      },
      _sum: { totalCents: true }
    })

    // Calcular crescimento
    const currentMonthRevenue = thisMonthRevenue._sum.totalCents || 0
    const previousMonthRevenue = lastMonthRevenue._sum.totalCents || 0
    const growthPercentage = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0

    // Invoices recentes
    const recentInvoices = await prisma.invoice.findMany({
      where: { orgId },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Estimativas recentes
    const recentEstimates = await prisma.estimate.findMany({
      where: { orgId },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Gráfico de receita dos últimos 6 meses
    const revenueChart = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthlyRevenue = await prisma.invoice.aggregate({
        where: { 
          orgId,
          status: 'paid',
          paidAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { totalCents: true }
      })
      
      revenueChart.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenue: monthlyRevenue._sum.totalCents || 0
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalInvoices,
          openEstimates,
          paidInvoices,
          totalRevenue: totalRevenue._sum.totalCents || 0,
          pendingRevenue: pendingRevenue._sum.totalCents || 0,
          thisMonthRevenue: currentMonthRevenue,
          lastMonthRevenue: previousMonthRevenue,
          growthPercentage: Math.round(growthPercentage * 100) / 100,
          totalClients,
          totalItems
        },
        recentInvoices,
        recentEstimates,
        revenueChart
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar dados do dashboard' 
      },
      { status: 500 }
    )
  }
}
