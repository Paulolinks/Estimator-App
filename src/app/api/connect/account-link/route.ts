import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json()

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Error creating account link:', error)
    return NextResponse.json(
      { error: 'Failed to create account link' },
      { status: 500 }
    )
  }
}
