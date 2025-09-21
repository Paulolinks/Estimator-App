/**
 * Utility functions for money handling (always in cents)
 */

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function parseMoneyToCents(value: string): number {
  // Remove currency symbols and parse to cents
  const cleanValue = value.replace(/[^\d,.-]/g, '')
  const normalizedValue = cleanValue.replace(',', '.')
  return Math.round(parseFloat(normalizedValue) * 100)
}

export function roundToCents(amount: number): number {
  return Math.round(amount)
}

export function calculateSubtotal(lineItems: Array<{ quantity: number; unitCents: number }>): number {
  return lineItems.reduce((total, item) => total + (item.quantity * item.unitCents), 0)
}

export function calculateTax(subtotalCents: number, taxRate: number = 0): number {
  return Math.round(subtotalCents * taxRate)
}

export function calculateTotal(subtotalCents: number, taxCents: number, discountCents: number = 0): number {
  return subtotalCents + taxCents - discountCents
}
