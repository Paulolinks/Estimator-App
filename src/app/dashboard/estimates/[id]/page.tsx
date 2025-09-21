'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, PrinterIcon, ShareIcon } from '@heroicons/react/24/outline'

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
  customer: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  organization: {
    businessName?: string
    businessEmail?: string
    businessAddress?: string
    businessPhone?: string
    businessWebsite?: string
    settings?: {
      businessName?: string
      businessEmail?: string
      businessAddress?: string
      businessPhone?: string
      businessWebsite?: string
      logoUrl?: string
    }
  }
  lineItems: EstimateLineItem[]
}

export default function ViewEstimatePage({ params }: { params: Promise<{ id: string }> }) {
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
        const formattedEstimate = {
          ...result.data,
          estimateDate: new Date(result.data.estimateDate).toLocaleDateString('pt-BR'),
          validUntil: new Date(result.data.validUntil).toLocaleDateString('pt-BR'),
        }
        setEstimate(formattedEstimate)
      } else {
        setError(result.error || 'Estimate not found.')
      }
    } catch (err) {
      console.error('Error fetching estimate:', err)
      setError('Error loading estimate.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/dashboard/estimates"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimate #{estimate.estimateNumber}</h1>
            <p className="text-gray-600 mt-1">View estimate</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/estimates/${estimate.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Estimate Details */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Estimate #{estimate.estimateNumber}</h1>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(estimate.status)}`}>
            {estimate.status}
          </span>
        </div>
        <p className="text-gray-600 mt-2">Date: {estimate.estimateDate}</p>
        <p className="text-gray-600">Valid Until: {estimate.validUntil}</p>
      </div>

      {/* Business and Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">From:</h2>
          {estimate.organization.settings?.logoUrl && (
            <div className="mb-4">
              <img 
                src={estimate.organization.settings.logoUrl} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <p className="font-medium text-gray-900">
            {estimate.organization.settings?.businessName || estimate.organization.businessName || 'Company Name'}
          </p>
          <p className="text-gray-600">
            {estimate.organization.settings?.businessEmail || estimate.organization.businessEmail}
          </p>
          <p className="text-gray-600">
            {estimate.organization.settings?.businessPhone || estimate.organization.businessPhone}
          </p>
          <p className="text-gray-600">
            {estimate.organization.settings?.businessAddress || estimate.organization.businessAddress}
          </p>
          <p className="text-gray-600">
            {estimate.organization.settings?.businessWebsite || estimate.organization.businessWebsite}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Bill To:</h2>
          <p className="font-medium text-gray-900">{estimate.customer.name}</p>
          <p className="text-gray-600">{estimate.customer.email}</p>
          <p className="text-gray-600">{estimate.customer.phone}</p>
          <p className="text-gray-600">{estimate.customer.address}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estimate.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                      {item.additionalDetails && (
                        <div className="text-sm text-gray-500">{item.additionalDetails}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unitCents)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="mb-8">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatCurrency(estimate.subtotalCents)}</span>
            </div>
            {estimate.taxCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">{formatCurrency(estimate.taxCents)}</span>
              </div>
            )}
            {estimate.discountCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="text-gray-900">-{formatCurrency(estimate.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>{formatCurrency(estimate.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {estimate.notes && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Notes</h2>
          <div className="text-gray-600">
            <p>{estimate.notes}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Link
          href={`/dashboard/estimates/${estimate.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Estimate
        </Link>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <PrinterIcon className="h-4 w-4 mr-2" />
          Print
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <ShareIcon className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>
    </div>
  )
}
