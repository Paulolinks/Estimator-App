'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  EyeIcon, 
  PencilIcon, 
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

interface Estimate {
  id: string
  estimateNumber: string
  estimateDate: string
  validUntil: string
  status: string
  totalCents: number
  customer: {
    name: string
    email?: string
  }
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEstimates()
  }, [])

  const fetchEstimates = async () => {
    try {
      const response = await fetch('/api/estimates?orgId=cmfsgmdw5000010qta3xlllvm')
      const result = await response.json()
      
      if (result.success) {
        setEstimates(result.data.estimates)
      }
    } catch (error) {
      console.error('Error fetching estimates:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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
        <div className="text-gray-500">Loading estimates...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
          <p className="mt-2 text-gray-600">Manage your estimates</p>
        </div>
        <Link
          href="/dashboard/estimates/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Estimate
        </Link>
      </div>

      {/* Estimates List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {estimates.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No estimates</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new estimate.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/estimates/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Estimate
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {estimates.map((estimate) => (
              <li key={estimate.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Estimate #{estimate.estimateNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {estimate.customer.name} • {formatDate(estimate.estimateDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(estimate.totalCents)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Valid until {formatDate(estimate.validUntil)}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(estimate.status)}`}>
                      {estimate.status}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/estimates/${estimate.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/estimates/${estimate.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
