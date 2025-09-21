import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para configurações
const updateSettingsSchema = z.object({
  orgId: z.string().min(1, 'Organization ID é obrigatório'),
  businessName: z.string().optional(),
  businessEmail: z.string().email('Email inválido').optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessZipCode: z.string().optional(),
  businessCountry: z.string().optional(),
  businessWebsite: z.string().url('Website inválido').optional().or(z.literal('')).nullable().transform(val => val || ''),
  logoUrl: z.string().url('URL do logo inválida').optional().or(z.literal('')).nullable().transform(val => val || ''),
  defaultCurrency: z.string().optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  defaultInvoicePrefix: z.string().optional(),
  defaultEstimatePrefix: z.string().optional(),
  invoiceNotes: z.string().optional().nullable().transform(val => val || ''),
  estimateNotes: z.string().optional().nullable().transform(val => val || ''),
  requireClientSignature: z.boolean().optional(),
  showFinancingOptions: z.boolean().optional()
})

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

    // Buscar configurações da organização
    const settings = await prisma.organizationSettings.findUnique({
      where: { orgId },
      include: {
        organization: true
      }
    })

    if (!settings) {
      // Criar configurações padrão se não existirem
      const defaultSettings = await prisma.organizationSettings.create({
        data: {
          orgId,
          defaultCurrency: 'USD',
          defaultTaxRate: 0,
          defaultInvoicePrefix: 'INV',
          defaultEstimatePrefix: 'EST',
          requireClientSignature: false,
          showFinancingOptions: false
        },
        include: {
          organization: true
        }
      })

      return NextResponse.json({
        success: true,
        data: defaultSettings
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar configurações' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    // Verificar se configurações já existem
    const existingSettings = await prisma.organizationSettings.findUnique({
      where: { orgId: validatedData.orgId }
    })

    let settings

    if (existingSettings) {
      // Atualizar configurações existentes
      settings = await prisma.organizationSettings.update({
        where: { orgId: validatedData.orgId },
        data: {
          businessName: validatedData.businessName,
          businessEmail: validatedData.businessEmail,
          businessPhone: validatedData.businessPhone,
          businessAddress: validatedData.businessAddress,
          businessCity: validatedData.businessCity,
          businessState: validatedData.businessState,
          businessZipCode: validatedData.businessZipCode,
          businessCountry: validatedData.businessCountry,
          businessWebsite: validatedData.businessWebsite,
          logoUrl: validatedData.logoUrl,
          defaultCurrency: validatedData.defaultCurrency,
          defaultTaxRate: validatedData.defaultTaxRate,
          defaultInvoicePrefix: validatedData.defaultInvoicePrefix,
          defaultEstimatePrefix: validatedData.defaultEstimatePrefix,
          invoiceNotes: validatedData.invoiceNotes,
          estimateNotes: validatedData.estimateNotes,
          requireClientSignature: validatedData.requireClientSignature,
          showFinancingOptions: validatedData.showFinancingOptions
        },
        include: {
          organization: true
        }
      })
    } else {
      // Criar novas configurações
      settings = await prisma.organizationSettings.create({
        data: {
          orgId: validatedData.orgId,
          businessName: validatedData.businessName,
          businessEmail: validatedData.businessEmail,
          businessPhone: validatedData.businessPhone,
          businessAddress: validatedData.businessAddress,
          businessCity: validatedData.businessCity,
          businessState: validatedData.businessState,
          businessZipCode: validatedData.businessZipCode,
          businessCountry: validatedData.businessCountry,
          businessWebsite: validatedData.businessWebsite,
          logoUrl: validatedData.logoUrl,
          defaultCurrency: validatedData.defaultCurrency,
          defaultTaxRate: validatedData.defaultTaxRate,
          defaultInvoicePrefix: validatedData.defaultInvoicePrefix,
          defaultEstimatePrefix: validatedData.defaultEstimatePrefix,
          invoiceNotes: validatedData.invoiceNotes,
          estimateNotes: validatedData.estimateNotes,
          requireClientSignature: validatedData.requireClientSignature,
          showFinancingOptions: validatedData.showFinancingOptions
        },
        include: {
          organization: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    
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
        error: 'Erro ao salvar configurações' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    // Verificar se configurações existem
    const existingSettings = await prisma.organizationSettings.findUnique({
      where: { orgId: validatedData.orgId }
    })

    let settings

    if (existingSettings) {
      // Atualizar configurações existentes
      settings = await prisma.organizationSettings.update({
        where: { orgId: validatedData.orgId },
        data: {
          businessName: validatedData.businessName,
          businessEmail: validatedData.businessEmail,
          businessPhone: validatedData.businessPhone,
          businessAddress: validatedData.businessAddress,
          businessCity: validatedData.businessCity,
          businessState: validatedData.businessState,
          businessZipCode: validatedData.businessZipCode,
          businessCountry: validatedData.businessCountry,
          businessWebsite: validatedData.businessWebsite,
          logoUrl: validatedData.logoUrl,
          defaultCurrency: validatedData.defaultCurrency,
          defaultTaxRate: validatedData.defaultTaxRate,
          defaultInvoicePrefix: validatedData.defaultInvoicePrefix,
          defaultEstimatePrefix: validatedData.defaultEstimatePrefix,
          invoiceNotes: validatedData.invoiceNotes,
          estimateNotes: validatedData.estimateNotes,
          requireClientSignature: validatedData.requireClientSignature,
          showFinancingOptions: validatedData.showFinancingOptions
        },
        include: {
          organization: true
        }
      })
    } else {
      // Criar novas configurações
      settings = await prisma.organizationSettings.create({
        data: {
          orgId: validatedData.orgId,
          businessName: validatedData.businessName,
          businessEmail: validatedData.businessEmail,
          businessPhone: validatedData.businessPhone,
          businessAddress: validatedData.businessAddress,
          businessCity: validatedData.businessCity,
          businessState: validatedData.businessState,
          businessZipCode: validatedData.businessZipCode,
          businessCountry: validatedData.businessCountry,
          businessWebsite: validatedData.businessWebsite,
          logoUrl: validatedData.logoUrl,
          defaultCurrency: validatedData.defaultCurrency || 'USD',
          defaultTaxRate: validatedData.defaultTaxRate || 0,
          defaultInvoicePrefix: validatedData.defaultInvoicePrefix || 'INV',
          defaultEstimatePrefix: validatedData.defaultEstimatePrefix || 'EST',
          invoiceNotes: validatedData.invoiceNotes,
          estimateNotes: validatedData.estimateNotes,
          requireClientSignature: validatedData.requireClientSignature || false,
          showFinancingOptions: validatedData.showFinancingOptions || false
        },
        include: {
          organization: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    
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
        error: 'Erro ao atualizar configurações' 
      },
      { status: 500 }
    )
  }
}
