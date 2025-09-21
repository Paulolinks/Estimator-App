'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  name: string
  description?: string
  sku?: string
  priceCents: number
  costCents: number
  category?: string
  unit: string
  taxable: boolean
  active: boolean
  notes?: string
}

interface ItemFormProps {
  item?: Item
}

export default function ItemForm({ item }: ItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    cost: '',
    category: '',
    unit: 'each',
    taxable: true,
    active: true,
    notes: ''
  })

  // Se estamos editando um item existente, carregar os dados
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        sku: item.sku || '',
        price: (item.priceCents / 100).toString(),
        cost: (item.costCents / 100).toString(),
        category: item.category || '',
        unit: item.unit,
        taxable: item.taxable,
        active: item.active,
        notes: item.notes || ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = item ? `/api/items/${item.id}` : '/api/items'
      const method = item ? 'PUT' : 'POST'
      
      const requestBody: any = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        category: formData.category,
        unit: formData.unit,
        taxable: formData.taxable,
        active: formData.active,
        notes: formData.notes
      }

      // Se estivermos criando um novo item, adicionar orgId e priceCents/costCents
      if (!item) {
        requestBody.orgId = 'cmfsgmdw5000010qta3xlllvm'
        requestBody.priceCents = Math.round(parseFloat(formData.price) * 100)
        requestBody.costCents = Math.round(parseFloat(formData.cost) * 100)
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
        router.push('/items')
      } else {
        console.error(`Erro ao ${item ? 'atualizar' : 'criar'} item:`, result.error)
        alert(`Erro ao ${item ? 'atualizar' : 'criar'} item: ` + result.error)
      }
    } catch (error) {
      console.error(`Erro ao ${item ? 'atualizar' : 'criar'} item:`, error)
      alert(`Erro ao ${item ? 'atualizar' : 'criar'} item`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {item ? 'Edit Item Information' : 'Item Information'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              id="price"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <input
              type="number"
              step="0.01"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="each">Each</option>
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="kg">Kilogram</option>
              <option value="lb">Pound</option>
              <option value="m">Meter</option>
              <option value="ft">Foot</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="taxable"
              name="taxable"
              checked={formData.taxable}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="taxable" className="ml-2 block text-sm text-gray-900">
              Taxable
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/items')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (item ? 'Update Item' : 'Save Item')}
        </button>
      </div>
    </form>
  )
}
