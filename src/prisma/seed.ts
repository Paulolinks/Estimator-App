import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Empresa Teste',
      billingMode: 'connect',
    }
  })

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'admin@teste.com',
      name: 'Administrador',
    }
  })

  // Create membership
  await prisma.membership.create({
    data: {
      orgId: organization.id,
      userId: user.id,
      role: 'OWNER'
    }
  })

  // Create a test customer
  const customer = await prisma.customer.create({
    data: {
      orgId: organization.id,
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      phone: '(11) 99999-9999'
    }
  })

  // Create a contract template
  await prisma.contractTemplate.create({
    data: {
      orgId: organization.id,
      name: 'Contrato Padrão',
      content: `
# Contrato de Prestação de Serviços

**Cliente:** {{customer_name}}  
**Serviço:** {{service_description}}  
**Valor Total:** {{total_amount}}  
**Data:** {{current_date}}

## Termos e Condições

1. O pagamento será realizado em duas parcelas: 50% como sinal e 50% na conclusão.
2. O prazo para execução é de {{estimated_days}} dias úteis.
3. O cliente se compromete a fornecer todas as informações necessárias.

**Assinatura Digital:** {{signature_date}}

---
*Este contrato foi gerado automaticamente pelo sistema Estimator App.*
      `.trim()
    }
  })

  console.log('Seed data created successfully!')
  console.log('Organization ID:', organization.id)
  console.log('User ID:', user.id)
  console.log('Customer ID:', customer.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
