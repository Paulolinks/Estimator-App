import { notFound } from 'next/navigation'

interface EstimatePageProps {
  params: Promise<{ estimateId: string }>
}

export default async function EstimatePage({ params }: EstimatePageProps) {
  const { estimateId } = await params
  // This would normally fetch the estimate from the database
  // For now, we'll show a placeholder
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Orçamento #{estimateId}
          </h1>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-yellow-800 mb-2">
                Página Pública do Orçamento
              </h2>
              <p className="text-yellow-700">
                Esta página será implementada para exibir o orçamento de forma pública,
                permitindo que o cliente visualize e aceite o contrato.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Funcionalidades que serão implementadas:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Visualização do orçamento com itens e totais
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Preview do contrato com placeholders preenchidos
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Formulário de aceite com assinatura digital
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Botão para gerar pagamento do sinal
                </li>
              </ul>
            </div>
            
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                Para testar o sistema, use as rotas da API diretamente ou implemente
                a interface completa seguindo as especificações do projeto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
