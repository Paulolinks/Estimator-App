'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalInvoices: number
  totalEstimates: number
  totalClients: number
  totalRevenue: number
  pendingInvoices: number
  pendingEstimates: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalEstimates: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingEstimates: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      console.log('Fetching dashboard stats...')
      
      // Simulate a delay to test loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, set default stats to test if dashboard loads
      setStats({
        totalInvoices: 5,
        totalEstimates: 3,
        totalClients: 8,
        totalRevenue: 15000,
        pendingInvoices: 2,
        pendingEstimates: 1
      })
      
      console.log('Dashboard stats set successfully')
      
      // TODO: Re-enable API calls once basic dashboard is working
      /*
      // Fetch invoices
      const invoicesResponse = await fetch('/api/invoices?orgId=cmfsgmdw5000010qta3xlllvm')
      console.log('Invoices response status:', invoicesResponse.status)
      const invoicesResult = await invoicesResponse.json()
      console.log('Invoices result:', invoicesResult)
      
      // Fetch estimates
      const estimatesResponse = await fetch('/api/estimates?orgId=cmfsgmdw5000010qta3xlllvm')
      console.log('Estimates response status:', estimatesResponse.status)
      const estimatesResult = await estimatesResponse.json()
      console.log('Estimates result:', estimatesResult)
      
      // Fetch clients
      const clientsResponse = await fetch('/api/clients?orgId=cmfsgmdw5000010qta3xlllvm')
      console.log('Clients response status:', clientsResponse.status)
      const clientsResult = await clientsResponse.json()
      console.log('Clients result:', clientsResult)

      const invoices = invoicesResult.success ? invoicesResult.data.invoices : []
      const estimates = estimatesResult.success ? estimatesResult.data.estimates : []
      const clients = clientsResult.success ? clientsResult.data.clients : []

      console.log('Processed data:', { invoices: invoices.length, estimates: estimates.length, clients: clients.length })

      const totalRevenue = invoices.reduce((sum: number, invoice: any) => {
        return sum + (invoice.totalCents / 100)
      }, 0)

      const pendingInvoices = invoices.filter((invoice: any) => 
        invoice.status === 'pending' || invoice.status === 'sent'
      ).length

      const pendingEstimates = estimates.filter((estimate: any) => 
        estimate.status === 'pending' || estimate.status === 'sent'
      ).length

      setStats({
        totalInvoices: invoices.length,
        totalEstimates: estimates.length,
        totalClients: clients.length,
        totalRevenue,
        pendingInvoices,
        pendingEstimates
      })
      */
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set default stats on error
      setStats({
        totalInvoices: 0,
        totalEstimates: 0,
        totalClients: 0,
        totalRevenue: 0,
        pendingInvoices: 0,
        pendingEstimates: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  // Debug: Show current state
  console.log('Dashboard rendering with stats:', stats)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your Estimator App dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Invoices */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Invoices
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalInvoices}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/invoices" className="font-medium text-blue-600 hover:text-blue-500">
                View all invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Total Estimates */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Estimates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalEstimates}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/estimates" className="font-medium text-green-600 hover:text-green-500">
                View all estimates
              </Link>
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalClients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/clients" className="font-medium text-purple-600 hover:text-purple-500">
                View all clients
              </Link>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/reports" className="font-medium text-yellow-600 hover:text-yellow-500">
                View reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/invoices/new"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <DocumentTextIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Create Invoice
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new invoice for your client
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/estimates/new"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Create Estimate
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new estimate for your client
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/clients/new"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <UserGroupIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Add Client
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add a new client to your database
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      {(stats.pendingInvoices > 0 || stats.pendingEstimates > 0) && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Pending Items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.pendingInvoices > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        {stats.pendingInvoices} Pending Invoice{stats.pendingInvoices !== 1 ? 's' : ''}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <Link href="/dashboard/invoices" className="font-medium underline hover:text-yellow-600">
                          Review pending invoices →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats.pendingEstimates > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        {stats.pendingEstimates} Pending Estimate{stats.pendingEstimates !== 1 ? 's' : ''}
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <Link href="/dashboard/estimates" className="font-medium underline hover:text-blue-600">
                          Review pending estimates →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
