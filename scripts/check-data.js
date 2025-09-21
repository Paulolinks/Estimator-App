const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('=== VERIFICANDO DADOS ===\n')

    // Verificar organizações
    const orgs = await prisma.organization.findMany()
    console.log('Organizações:', orgs.length)
    orgs.forEach(org => {
      console.log(`- ${org.name} (${org.id})`)
    })

    // Verificar clientes
    const customers = await prisma.customer.findMany()
    console.log('\nClientes:', customers.length)
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.id}) - Org: ${customer.orgId}`)
    })

    // Verificar estimativas
    const estimates = await prisma.estimate.findMany()
    console.log('\nEstimativas:', estimates.length)
    estimates.forEach(estimate => {
      console.log(`- ${estimate.estimateNumber} (${estimate.id}) - Status: ${estimate.status}`)
    })

    // Verificar faturas
    const invoices = await prisma.invoice.findMany()
    console.log('\nFaturas:', invoices.length)
    invoices.forEach(invoice => {
      console.log(`- ${invoice.invoiceNumber} (${invoice.id}) - Status: ${invoice.status}`)
    })

  } catch (error) {
    console.error('Erro ao verificar dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
