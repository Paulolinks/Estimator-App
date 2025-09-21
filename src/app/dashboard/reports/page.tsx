'use client'

import React from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">View your business analytics and reports</p>
      </div>

      {/* Reports Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Reports Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">
            We&apos;re working on comprehensive reporting features for your business analytics.
          </p>
        </div>
      </div>
    </div>
  )
}
