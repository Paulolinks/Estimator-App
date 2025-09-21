'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Settings {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessCity: string
  businessState: string
  businessZipCode: string
  businessCountry: string
  businessWebsite: string
  logoUrl: string
  defaultCurrency: string
  defaultTaxRate: number
  defaultInvoicePrefix: string
  defaultEstimatePrefix: string
  invoiceNotes: string
  estimateNotes: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessCountry: '',
    businessWebsite: '',
    logoUrl: '',
    defaultCurrency: 'BRL',
    defaultTaxRate: 0,
    defaultInvoicePrefix: 'INV',
    defaultEstimatePrefix: 'EST',
    invoiceNotes: '',
    estimateNotes: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/business?orgId=cmfsgmdw5000010qta3xlllvm')
      const result = await response.json()
      
      if (result.success && result.data) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: 'cmfsgmdw5000010qta3xlllvm',
          ...settings
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Configurações salvas com sucesso!')
      } else {
        console.error('Erro ao salvar configurações:', result.error)
        alert('Erro ao salvar configurações: ' + result.error)
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setSettings({
      ...settings,
      [name]: type === 'number' ? parseFloat(value) : value
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                Business Email
              </label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={settings.businessEmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                Business Phone
              </label>
              <input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                value={settings.businessPhone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700">
                Business Website
              </label>
              <input
                type="url"
                id="businessWebsite"
                name="businessWebsite"
                value={settings.businessWebsite}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                Company Logo URL
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                value={settings.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the URL of your company logo. The logo will appear on invoices and estimates.
              </p>
              {settings.logoUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                  <img 
                    src={settings.logoUrl} 
                    alt="Company Logo Preview" 
                    className="h-16 w-auto object-contain border border-gray-300 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                Business Address
              </label>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={settings.businessAddress}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="businessCity"
                name="businessCity"
                value={settings.businessCity}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessState" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="businessState"
                name="businessState"
                value={settings.businessState}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessZipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                id="businessZipCode"
                name="businessZipCode"
                value={settings.businessZipCode}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="businessCountry" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="businessCountry"
                name="businessCountry"
                value={settings.businessCountry}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Default Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                Default Currency
              </label>
              <select
                id="defaultCurrency"
                name="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BRL">BRL - Brazilian Real</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div>
              <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                id="defaultTaxRate"
                name="defaultTaxRate"
                value={settings.defaultTaxRate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="defaultInvoicePrefix" className="block text-sm font-medium text-gray-700">
                Invoice Prefix
              </label>
              <input
                type="text"
                id="defaultInvoicePrefix"
                name="defaultInvoicePrefix"
                value={settings.defaultInvoicePrefix}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="defaultEstimatePrefix" className="block text-sm font-medium text-gray-700">
                Estimate Prefix
              </label>
              <input
                type="text"
                id="defaultEstimatePrefix"
                name="defaultEstimatePrefix"
                value={settings.defaultEstimatePrefix}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="invoiceNotes" className="block text-sm font-medium text-gray-700">
              Default Invoice Notes
            </label>
            <textarea
              id="invoiceNotes"
              name="invoiceNotes"
              rows={3}
              value={settings.invoiceNotes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="estimateNotes" className="block text-sm font-medium text-gray-700">
              Default Estimate Notes
            </label>
            <textarea
              id="estimateNotes"
              name="estimateNotes"
              rows={3}
              value={settings.estimateNotes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
