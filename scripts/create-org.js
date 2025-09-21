const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createOrganization() {
  try {
    // Verificar se já existe uma organização
    const existingOrg = await prisma.organization.findFirst()
    
    if (existingOrg) {
      console.log('Organização já existe:', existingOrg.id)
      return existingOrg
    }

    // Criar organização padrão
    const organization = await prisma.organization.create({
      data: {
        name: 'Minha Empresa',
        billingMode: 'single',
        settings: {
          create: {
            businessName: 'Minha Empresa',
            businessEmail: 'contato@minhaempresa.com',
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

    console.log('Organização criada:', organization.id)
    return organization
  } catch (error) {
    console.error('Erro ao criar organização:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createOrganization()
