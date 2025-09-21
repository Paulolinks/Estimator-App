import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { calculateApplicationFee } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { estimateId } = await request.json()

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        organization: true,
        customer: true,
        invoiceRecords: true
      }
    })

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    // Check if deposit was paid
    const depositPaid = estimate.invoiceRecords.some(
      record => record.type === 'deposit' && record.status === 'paid'
    )

    if (!depositPaid) {
      return NextResponse.json(
        { error: 'Deposit must be paid before generating balance invoice' },
        { status: 400 }
      )
    }

    if (!estimate.organization.stripeAccountId) {
      return NextResponse.json(
        { error: 'Organization not connected to Stripe' },
        { status: 400 }
      )
    }

    // Calculate balance amount (remaining 50%)
    const balanceAmount = Math.round(estimate.totalCents * 0.5)
    const applicationFee = calculateApplicationFee(balanceAmount)

    // Create customer in connected account
    const customer = await stripe.customers.create({
      email: estimate.customer.email || undefined,
      name: estimate.customer.name,
    }, {
      stripeAccount: estimate.organization.stripeAccountId
    })

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 7,
    }, {
      stripeAccount: estimate.organization.stripeAccountId
    })

    // Add invoice item
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: balanceAmount,
      currency: 'brl',
      description: `Saldo - ${estimate.customer.name}`,
    }, {
      stripeAccount: estimate.organization.stripeAccountId
    })

    // Finalize invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
      // application_fee_amount is not supported in finalizeInvoice
    }, {
      stripeAccount: estimate.organization.stripeAccountId
    })

    // Save invoice record
    await prisma.invoiceRecord.create({
      data: {
        estimateId,
        type: 'balance',
        stripeInvoiceId: finalizedInvoice.id,
        hostedUrl: finalizedInvoice.hosted_invoice_url!,
        amountCents: balanceAmount,
        status: 'open'
      }
    })

    return NextResponse.json({
      hostedUrl: finalizedInvoice.hosted_invoice_url,
      invoiceId: finalizedInvoice.id
    })
  } catch (error) {
    console.error('Error creating balance invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create balance invoice' },
      { status: 500 }
    )
  }
}
