'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ItemSelector from './ItemSelector'

interface EstimateItem {
  id: string
  description: string
  additionalDetails: string
  rate: number
  quantity: number
  amount: number
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
  lineItems: Array<{
    id: string
    description: string
    additionalDetails?: string
    quantity: number
    unitCents: number
    amountCents: number
  }>
}

interface EstimateFormProps {
  estimate?: Estimate
}

export default function EstimateForm({ estimate }: EstimateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<EstimateItem[]>([
    {
      id: '1',
      description: '',
      additionalDetails: '',
      rate: 0,
      quantity: 1,
      amount: 0
    }
  ])

  const [formData, setFormData] = useState({
    customerId: '',
    estimateDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  })

  // Se estamos editando um estimate existente, carregar os dados
  useEffect(() => {
    if (estimate) {
      setFormData({
        customerId: estimate.customerId,
        estimateDate: new Date(estimate.estimateDate).toISOString().split('T')[0],
        validUntil: new Date(estimate.validUntil).toISOString().split('T')[0],
        notes: estimate.notes || ''
      })

      // Converter lineItems para o formato esperado
      const formattedItems = estimate.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        additionalDetails: item.additionalDetails || '',
        rate: item.unitCents / 100,
        quantity: item.quantity,
        amount: item.amountCents / 100
      }))

      setItems(formattedItems.length > 0 ? formattedItems : [{
        id: '1',
        description: '',
        additionalDetails: '',
        rate: 0,
        quantity: 1,
        amount: 0
      }])
    }
  }, [estimate])

  // Escutar evento de item selecionado
  useEffect(() => {
    const handleItemSelected = (event: CustomEvent) => {
      const { name, price, unit } = event.detail
      
      // Encontrar o último item adicionado e atualizar com os dados do item selecionado
      setItems(prevItems => {
        const newItems = [...prevItems]
        const lastItem = newItems[newItems.length - 1]
        if (lastItem) {
          lastItem.description = name
          lastItem.rate = price
          lastItem.amount = price * lastItem.quantity
        }
        return newItems
      })
    }

    window.addEventListener('itemSelected', handleItemSelected as EventListener)
    return () => {
      window.removeEventListener('itemSelected', handleItemSelected as EventListener)
    }
  }, [])

  const addItem = () => {
    const newItem: EstimateItem = {
      id: Date.now().toString(),
      description: '',
      additionalDetails: '',
      rate: 0,
      quantity: 1,
      amount: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'rate' || field === 'quantity') {
          updatedItem.amount = updatedItem.rate * updatedItem.quantity
        }
        return updatedItem
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * 0.1 // 10% de imposto
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = estimate ? `/api/estimates/${estimate.id}` : '/api/estimates'
      const method = estimate ? 'PUT' : 'POST'
      
      const requestBody: any = {
        customerId: formData.customerId,
        estimateDate: new Date(formData.estimateDate),
        validUntil: new Date(formData.validUntil),
        notes: formData.notes,
        subtotalCents: Math.round(subtotal * 100),
        taxCents: Math.round(tax * 100),
        totalCents: Math.round(total * 100),
        lineItems: items.map(item => ({
          id: item.id,
          description: item.description,
          additionalDetails: item.additionalDetails,
          quantity: item.quantity,
          unitCents: Math.round(item.rate * 100),
          amountCents: Math.round(item.amount * 100)
        }))
      }

      // Se estivermos criando um novo estimate, adicionar orgId
      if (!estimate) {
        requestBody.orgId = 'cmfsgmdw5000010qta3xlllvm'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/estimates')
      } else {
        console.error(`Erro ao ${estimate ? 'atualizar' : 'criar'} estimativa:`, result.error)
        alert(`Erro ao ${estimate ? 'atualizar' : 'criar'} estimativa: ` + result.error)
      }
    } catch (error) {
      console.error(`Erro ao ${estimate ? 'atualizar' : 'criar'} estimativa:`, error)
      alert(`Erro ao ${estimate ? 'atualizar' : 'criar'} estimativa`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {estimate ? 'Edit Estimate Details' : 'Estimate Details'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
              Client *
            </label>
            <select
              id="customerId"
              name="customerId"
              required
              value={formData.customerId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a client</option>
              <option value="cmfsgpi130001srwdv68mukvk">Paulo Henrique Gonçalves</option>
              <option value="cmfsgppyg0003srwdefdwl3ek">Paulo Henrique Gonçalves</option>
              <option value="cmfsgpys40005srwdqmdkvq3o">Amit Parkash</option>
            </select>
          </div>

          <div>
            <label htmlFor="estimateDate" className="block text-sm font-medium text-gray-700">
              Estimate Date *
            </label>
            <input
              type="date"
              id="estimateDate"
              name="estimateDate"
              required
              value={formData.estimateDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
              Valid Until *
            </label>
            <input
              type="date"
              id="validUntil"
              name="validUntil"
              required
              value={formData.validUntil}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Items */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-5">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <ItemSelector
                  value={item.description}
                  onChange={(value) => updateItem(item.id, 'description', value)}
                  placeholder="Select or type item name"
                  className="mt-1"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Details
                </label>
                <input
                  type="text"
                  value={item.additionalDetails}
                  onChange={(e) => updateItem(item.id, 'additionalDetails', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                  R$ {item.amount.toFixed(2)}
                </div>
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax (10%):</span>
              <span className="text-sm font-medium">R$ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/estimates')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (estimate ? 'Update Estimate' : 'Save Estimate')}
        </button>
      </div>
    </form>
  )
}