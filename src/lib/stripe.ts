import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const APPLICATION_FEE_PERCENTAGE = 0.06 // 6%

export function calculateApplicationFee(amountCents: number): number {
  return Math.round(amountCents * APPLICATION_FEE_PERCENTAGE)
}
