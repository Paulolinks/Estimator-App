import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const { estimateId } = await params
    const { email } = await request.json()

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        customer: true,
        lineItems: true,
        organization: true
      }
    })

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    // Update status to sent
    await prisma.estimate.update({
      where: { id: estimateId },
      data: { status: 'sent' }
    })

    // TODO: Implement email sending logic here
    // For now, just return success
    console.log(`Sending estimate ${estimateId} to ${email}`)

    return NextResponse.json({ 
      message: 'Estimate sent successfully',
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL}/estimate/${estimateId}`
    })
  } catch (error) {
    console.error('Error sending estimate:', error)
    return NextResponse.json(
      { error: 'Failed to send estimate' },
      { status: 500 }
    )
  }
}
