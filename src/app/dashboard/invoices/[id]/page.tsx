'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, PrinterIcon } from '@heroicons/react/24/outline'

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
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
  lineItems: Array<{
    id: string
    description: string
    additionalDetails?: string
    quantity: number
    unitCents: number
    amountCents: number
  }>
}

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchInvoice()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${id}`)
      const result = await response.json()

      if (result.success) {
        setInvoice(result.data)
      } else {
        setError(result.error || 'Fatura não encontrada.')
      }
    } catch (err) {
      console.error('Error fetching invoice:', err)
      setError('Erro ao carregar fatura.')
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
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando fatura...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Voltar para Invoices
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Fatura não encontrada</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>A fatura solicitada não foi encontrada.</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Voltar para Invoices
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/dashboard/invoices"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fatura #{invoice.invoiceNumber}</h1>
            <p className="text-gray-600 mt-1">Visualizar fatura</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar
          </Link>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Invoice Header */}
        <div className="px-6 py-8 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            {/* Business Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {invoice.organization.settings?.businessName || invoice.organization.businessName || 'Minha Empresa'}
              </h2>
              {invoice.organization.settings?.logoUrl && (
                <div className="mb-4">
                  <img 
                    src={invoice.organization.settings.logoUrl} 
                    alt="Company Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              <div className="text-gray-600 space-y-1">
                <p>{invoice.organization.settings?.businessEmail || invoice.organization.businessEmail || 'contato@minhaempresa.com'}</p>
                <p>{invoice.organization.settings?.businessPhone || invoice.organization.businessPhone || '+55 (11) 99999-9999'}</p>
                <p>{invoice.organization.settings?.businessAddress || invoice.organization.businessAddress || 'Rua das Flores, 123'}</p>
                <p>{invoice.organization.settings?.businessWebsite || invoice.organization.businessWebsite || 'www.minhaempresa.com'}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fatura</h2>
              <div className="text-gray-600 space-y-1">
                <p><strong>Número:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Data:</strong> {formatDate(invoice.invoiceDate)}</p>
                <p><strong>Vencimento:</strong> {formatDate(invoice.dueDate)}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Cliente</h3>
          <div className="text-gray-600">
            <p className="font-medium">{invoice.customer.name}</p>
            {invoice.customer.email && <p>{invoice.customer.email}</p>}
            {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
            {invoice.customer.address && <p>{invoice.customer.address}</p>}
          </div>
        </div>

        {/* Line Items */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unitário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.lineItems.map((item) => (
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
        <div className="px-6 py-6 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatCurrency(invoice.subtotalCents)}</span>
              </div>
              {invoice.taxCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.taxCents)}</span>
                </div>
              )}
              {invoice.discountCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desconto:</span>
                  <span className="text-gray-900">-{formatCurrency(invoice.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalCents)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 py-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
            <div className="text-gray-600">
              <p>{invoice.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
