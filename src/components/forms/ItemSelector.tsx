'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline'
import AddItemModal from '../modals/AddItemModal'

interface Item {
  id: string
  name: string
  description?: string
  priceCents: number
  unit: string
}

interface ItemSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function ItemSelector({ value, onChange, placeholder = "Select or type item name", className = "" }: ItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchItems()
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/items?orgId=cmfsgmdw5000010qta3xlllvm')
      const result = await response.json()
      
      if (result.success) {
        setItems(result.data.items)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleItemSelect = (item: Item) => {
    setSearchTerm(item.name)
    onChange(item.name)
    setIsOpen(false)
    
    // Disparar evento customizado com dados do item
    const event = new CustomEvent('itemSelected', { 
      detail: { 
        name: item.name,
        price: item.priceCents / 100,
        unit: item.unit
      } 
    })
    window.dispatchEvent(event)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleAddNewItem = async (itemData: any) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: 'cmfsgmdw5000010qta3xlllvm',
          name: itemData.name,
          description: itemData.description,
          priceCents: Math.round(itemData.price * 100),
          unit: itemData.unit,
          category: itemData.category
        })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh items list
        fetchItems()
        // Set the new item as selected
        onChange(itemData.name)
        setSearchTerm(itemData.name)
      } else {
        console.error('Error creating item:', result.error)
        alert('Error creating item: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Error creating item')
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ChevronDownIcon 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-gray-500 text-sm">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? 'No items found' : 'Start typing to search items'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemSelect(item)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-500">{item.description}</div>
                )}
                <div className="text-sm text-gray-600">
                  ${(item.priceCents / 100).toFixed(2)} / {item.unit}
                </div>
              </div>
            ))
          )}
          
          {/* Add New Item Button */}
          <div className="border-t border-gray-200">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Item
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddNewItem}
      />
    </div>
  )
}
