'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import EstimateForm from '@/components/forms/EstimateForm'

interface EstimateLineItem {
  id: string
  description: string
  additionalDetails?: string
  quantity: number
  unitCents: number
  amountCents: number
}

interface Estimate {
  id: string
  estimateNumber: string
  estimateDate: string
  validUntil: string
  status: string
  subtotalCents: number
  taxCents: number
  discountCents: number
  totalCents: number
  notes?: string
  customerId: string
  lineItems: EstimateLineItem[]
}

export default function EditEstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchEstimate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchEstimate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/estimates/${id}`)
      const result = await response.json()

      if (result.success) {
        setEstimate(result.data)
      } else {
        setError(result.error || 'Estimate not found.')
      }
    } catch (err) {
      console.error('Error fetching estimate:', err)
      setError('Error loading estimate for editing.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading estimate...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/estimates"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Estimates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Estimate not found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The requested estimate was not found.</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/estimates"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Estimates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Link
            href="/dashboard/estimates"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Estimate #{estimate.estimateNumber}</h1>
            <p className="text-gray-600 mt-1">Edit estimate details</p>
          </div>
        </div>
      </div>

      {/* Estimate Form */}
      <EstimateForm estimate={estimate} />
    </div>
  )
}
