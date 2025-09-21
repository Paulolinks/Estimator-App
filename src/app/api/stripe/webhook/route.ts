import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    // Save webhook event
    await prisma.webhookEvent.create({
      data: {
        stripeEvent: event.id,
        type: event.type,
        payload: event.data.object as any,
      }
    })

    // Handle different event types
    switch (event.type) {
      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as any)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as any)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as any)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as any)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { stripeEvent: event.id },
      data: { processedAt: new Date() }
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleInvoiceFinalized(invoice: any) {
  // Update invoice record with hosted URL
  await prisma.invoiceRecord.updateMany({
    where: { stripeInvoiceId: invoice.id },
    data: { hostedUrl: invoice.hosted_invoice_url }
  })
}

async function handleInvoicePaid(invoice: any) {
  // Mark invoice as paid
  await prisma.invoiceRecord.updateMany({
    where: { stripeInvoiceId: invoice.id },
    data: { status: 'paid' }
  })

  // Update estimate status if needed
  const invoiceRecord = await prisma.invoiceRecord.findFirst({
    where: { stripeInvoiceId: invoice.id },
    include: { estimate: true }
  })

  if (invoiceRecord) {
    // Check if all invoices are paid
    const allInvoices = await prisma.invoiceRecord.findMany({
      where: { estimateId: invoiceRecord.estimateId }
    })

    const allPaid = allInvoices.every(inv => inv.status === 'paid')
    
    if (allPaid) {
      await prisma.estimate.update({
        where: { id: invoiceRecord.estimateId },
        data: { status: 'completed' }
      })
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)
  // Additional logic for successful payments
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id)
  // Additional logic for failed payments
}
