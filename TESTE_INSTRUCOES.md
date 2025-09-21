# 🧪 Instruções de Teste - Estimator App

## ✅ Problemas Corrigidos

1. **APIs funcionais** - Todas as APIs estão com sintaxe correta
2. **Formulários conectados** - Botões agora salvam dados via API
3. **Componentes funcionais** - Criação de orçamentos e clientes funcionando
4. **Validação de dados** - Formulários com validação adequada

## 🚀 Como Testar

### 1. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/estimator_app"

# Stripe - Use suas chaves reais do Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_51QT9KeDtKhz2QbvYJHn...9g2FaVt75e00uZCmj7qS
STRIPE_WEBHOOK_SECRET=whsec_6711338130fe6b27922c037f5c9b3e488083676827d9c0bee02a63ab6a9d26ee

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configurar Banco de Dados

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# Configurar dados de teste
node scripts/setup-database.js
```

### 3. Iniciar o Servidor

```bash
npm run dev
```

### 4. Testar Funcionalidades

#### A. Testar Criação de Clientes
1. Acesse: http://localhost:3000/clients
2. Clique em "New Client"
3. Preencha o formulário
4. Clique em "Save Client"
5. ✅ Deve salvar e redirecionar para lista de clientes

#### B. Testar Criação de Orçamentos
1. Acesse: http://localhost:3000/estimates
2. Clique em "New Estimate"
3. Preencha informações da empresa e cliente
4. Adicione itens com descrição, taxa e quantidade
5. Clique em "Save Estimate"
6. ✅ Deve salvar e redirecionar para o orçamento

#### C. Testar Dashboard
1. Acesse: http://localhost:3000/dashboard
2. ✅ Deve mostrar estatísticas (mesmo que zeradas)
3. ✅ Botões de ação rápida devem funcionar

### 5. Testar APIs Diretamente

#### Testar API de Clientes
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "cliente@teste.com",
    "phone": "(11) 99999-9999",
    "orgId": "default-org"
  }'
```

#### Testar API de Orçamentos
```bash
curl -X POST http://localhost:3000/api/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "orgId": "default-org",
    "customerId": "test-customer",
    "subtotalCents": 10000,
    "totalCents": 10000,
    "notes": "Teste via API",
    "lineItems": [
      {
        "description": "Serviço Teste",
        "rateCents": 5000,
        "quantity": 2,
        "amountCents": 10000
      }
    ]
  }'
```

## 🔧 Funcionalidades Implementadas

### ✅ Formulários Funcionais
- **Criação de Clientes**: Formulário completo com validação
- **Criação de Orçamentos**: Formulário com itens dinâmicos
- **Validação**: Campos obrigatórios e tipos de dados
- **Feedback**: Mensagens de erro e sucesso

### ✅ APIs Funcionais
- **POST /api/clients**: Criar clientes
- **GET /api/clients**: Listar clientes
- **POST /api/estimates**: Criar orçamentos
- **GET /api/estimates**: Listar orçamentos
- **PUT /api/estimates/[id]**: Atualizar orçamentos

### ✅ Interface Melhorada
- **Botões funcionais**: Todos os botões agora executam ações
- **Navegação**: Links entre páginas funcionando
- **Responsividade**: Interface adaptável a diferentes telas
- **Feedback visual**: Estados de carregamento e erro

## 🐛 Problemas Conhecidos

1. **Autenticação**: Sistema de login não implementado (usando orgId fixo)
2. **Upload de arquivos**: Funcionalidade de logo/fotos não implementada
3. **Email**: Envio de emails não implementado
4. **PDF**: Geração de PDF não implementada
5. **Stripe Connect**: Integração completa não testada

## 📝 Próximos Passos

1. Implementar sistema de autenticação
2. Adicionar upload de arquivos
3. Implementar geração de PDF
4. Configurar envio de emails
5. Testar integração completa com Stripe

## 🎯 Resultado Esperado

Após seguir estas instruções, você deve ter:
- ✅ Formulários funcionando e salvando dados
- ✅ APIs respondendo corretamente
- ✅ Interface responsiva e interativa
- ✅ Dados sendo persistidos no banco
- ✅ Navegação entre páginas funcionando

**Status**: 🟢 **PRONTO PARA TESTE**
