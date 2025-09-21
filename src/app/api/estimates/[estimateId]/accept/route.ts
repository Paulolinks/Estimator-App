import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ estimateId: string }> }
) {
  try {
    const { estimateId } = await params
    const { signerName, contractContent } = await request.json()
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        organization: {
          include: {
            contractTemplates: {
              where: { active: true },
              take: 1
            }
          }
        }
      }
    })

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    // Create signature
    const signature = await prisma.signature.create({
      data: {
        estimateId: estimateId,
        signerName,
        ipAddress,
        signedAt: new Date()
      }
    })

    // Create contract snapshot
    const contractSnapshot = await prisma.contractSnapshot.create({
      data: {
        estimateId: estimateId,
        content: contractContent || estimate.organization.contractTemplates[0]?.content || ''
      }
    })

    // Update estimate status
    await prisma.estimate.update({
      where: { id: estimateId },
      data: {
        status: 'accepted',
        signatureId: signature.id,
        contractId: contractSnapshot.id
      }
    })

    return NextResponse.json({ 
      message: 'Estimate accepted successfully',
      signatureId: signature.id,
      contractId: contractSnapshot.id
    })
  } catch (error) {
    console.error('Error accepting estimate:', error)
    return NextResponse.json(
      { error: 'Failed to accept estimate' },
      { status: 500 }
    )
  }
}
