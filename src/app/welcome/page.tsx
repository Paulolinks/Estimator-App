import React from 'react'
import Link from 'next/link'

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Estimator App
          </h1>
          <p className="text-gray-600 mb-8">
            Sistema de orçamentos e pagamentos com Stripe Connect
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Funcionalidades
          </h2>
          
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Orçamentos com itens e totais
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Contratos com assinatura digital
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Pagamentos por marcos (50/50)
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Integração com Stripe Connect
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Taxa de 6% para a plataforma
            </li>
          </ul>
          
          <div className="pt-4">
            <Link 
              href="/dashboard"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
            >
              Acessar Dashboard
            </Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Para começar, configure as variáveis de ambiente no arquivo .env.local</p>
        </div>
      </div>
    </main>
  )
}