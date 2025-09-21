import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json()

    // Create connected account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'BR',
      email: 'test@example.com', // This should come from the user
    })

    // Save account ID to organization
    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeAccountId: account.id },
    })

    return NextResponse.json({ accountId: account.id })
  } catch (error) {
    console.error('Error creating connected account:', error)
    return NextResponse.json(
      { error: 'Failed to create connected account' },
      { status: 500 }
    )
  }
}
