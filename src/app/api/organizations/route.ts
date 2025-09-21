import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    // Criar organização
    const organization = await prisma.organization.create({
      data: {
        name: name || 'Minha Empresa',
        billingMode: 'connect',
        settings: {
          create: {
            businessName: name || 'Minha Empresa',
            businessEmail: email || 'contato@minhaempresa.com',
            defaultCurrency: 'BRL',
            defaultTaxRate: 0,
            defaultInvoicePrefix: 'INV',
            defaultEstimatePrefix: 'EST'
          }
        }
      },
      include: {
        settings: true
      }
    })

    return NextResponse.json({
      success: true,
      data: organization
    })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar organização' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        settings: true,
        _count: {
          select: {
            customers: true,
            invoices: true,
            estimates: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: organizations
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar organizações' 
      },
      { status: 500 }
    )
  }
}
