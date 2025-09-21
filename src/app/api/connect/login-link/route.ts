import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json()

    const loginLink = await stripe.accounts.createLoginLink(accountId)

    return NextResponse.json({ url: loginLink.url })
  } catch (error) {
    console.error('Error creating login link:', error)
    return NextResponse.json(
      { error: 'Failed to create login link' },
      { status: 500 }
    )
  }
}
