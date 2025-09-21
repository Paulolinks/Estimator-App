import React from 'react'
import Link from 'next/link'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CubeIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon },
  { name: 'Estimates', href: '/dashboard/estimates', icon: ClipboardDocumentListIcon },
  { name: 'Expenses', href: '/dashboard/expenses', icon: CurrencyDollarIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon },
  { name: 'Items', href: '/dashboard/items', icon: CubeIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-800 font-bold text-sm">✓</span>
                </div>
              </div>
              <h1 className="text-xl font-bold text-white">Estimator App</h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white text-sm">Login</button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
