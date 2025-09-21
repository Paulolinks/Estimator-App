const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...')
    
    // Create default organization
    const org = await prisma.organization.upsert({
      where: { id: 'default-org' },
      update: {},
      create: {
        id: 'default-org',
        name: 'Default Organization',
        billingMode: 'single',
        contractTemplateId: null
      }
    })
    
    console.log('✅ Default organization created:', org.name)
    
    // Create a test customer
    const customer = await prisma.customer.upsert({
      where: { id: 'test-customer' },
      update: {},
      create: {
        id: 'test-customer',
        orgId: 'default-org',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '(555) 123-4567'
      }
    })
    
    console.log('✅ Test customer created:', customer.name)
    
    // Create a test estimate
    const estimate = await prisma.estimate.upsert({
      where: { id: 'test-estimate' },
      update: {},
      create: {
        id: 'test-estimate',
        orgId: 'default-org',
        customerId: 'test-customer',
        subtotalCents: 10000, // $100.00
        taxCents: 0,
        discountCents: 0,
        totalCents: 10000,
        status: 'draft',
        notes: 'Test estimate for demonstration'
      }
    })
    
    console.log('✅ Test estimate created:', estimate.id)
    
    // Create line items for the estimate
    await prisma.lineItem.upsert({
      where: { id: 'test-line-item-1' },
      update: {},
      create: {
        id: 'test-line-item-1',
        estimateId: 'test-estimate',
        description: 'Test Service',
        additionalDetails: 'This is a test service for demonstration purposes',
        rateCents: 5000, // $50.00
        quantity: 2,
        amountCents: 10000 // $100.00
      }
    })
    
    console.log('✅ Test line item created')
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
