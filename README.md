# Estimator App

Sistema de orçamentos e pagamentos com Stripe Connect para prestadores de serviços.

## Funcionalidades

- ✅ Orçamentos com itens e totais
- ✅ Contratos com assinatura digital
- ✅ Pagamentos por marcos (50/50)
- ✅ Integração com Stripe Connect
- ✅ Taxa de 6% para a plataforma
- ✅ Webhooks para atualização de status
- ✅ Interface responsiva

## Stack Tecnológica

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Prisma
- **Stripe Connect** (Express/Standard)
- **NextAuth** para autenticação
- **Tailwind CSS** para estilização

## Pré-requisitos

1. **Node.js 18+** - [Download aqui](https://nodejs.org/)
2. **PostgreSQL** - [Download aqui](https://www.postgresql.org/) ou use [Supabase](https://supabase.com/) / [Neon](https://neon.tech/)
3. **Conta Stripe** - [Criar conta](https://stripe.com/)

## Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd estimator-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/estimator_app"

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o banco de dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar migrações
npm run db:push

# Popular com dados de teste
npm run db:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## Configuração do Stripe

### 1. Criar conta Stripe

1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Ative o modo de teste
3. Copie sua chave secreta de teste

### 2. Configurar webhooks

1. No dashboard do Stripe, vá para "Webhooks"
2. Adicione um novo endpoint: `http://localhost:3000/api/stripe/webhook`
3. Selecione os eventos:
   - `invoice.finalized`
   - `invoice.paid`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copie o secret do webhook

### 3. Testar Stripe Connect

1. Acesse o dashboard em `/dashboard`
2. Use as rotas da API para conectar uma conta Stripe
3. Teste o fluxo completo de pagamentos

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── connect/          # Stripe Connect
│   │   ├── estimates/        # CRUD de orçamentos
│   │   ├── invoices/         # Geração de faturas
│   │   └── stripe/
│   │       └── webhook/      # Webhooks do Stripe
│   ├── (dashboard)/          # Páginas do dashboard
│   └── globals.css
├── components/
│   ├── forms/                # Formulários
│   ├── estimate/             # Componentes de orçamento
│   └── payments/             # Componentes de pagamento
├── lib/
│   ├── stripe.ts            # Configuração do Stripe
│   ├── prisma.ts            # Cliente Prisma
│   ├── money.ts             # Utilitários de dinheiro
│   └── auth.ts              # Configuração NextAuth
└── prisma/
    ├── schema.prisma        # Schema do banco
    └── seed.ts              # Dados iniciais
```

## API Endpoints

### Connect (Stripe Connect)
- `POST /api/connect/create-account` - Criar conta conectada
- `POST /api/connect/account-link` - Gerar link de onboarding
- `POST /api/connect/login-link` - Gerar link de login

### Estimates
- `GET /api/estimates` - Listar orçamentos
- `POST /api/estimates` - Criar orçamento
- `GET /api/estimates/[id]` - Buscar orçamento
- `PUT /api/estimates/[id]` - Atualizar orçamento

### Invoices
- `POST /api/invoices/deposit` - Gerar fatura de sinal
- `POST /api/invoices/balance` - Gerar fatura de saldo

### Webhooks
- `POST /api/stripe/webhook` - Webhook do Stripe

## Fluxo de Pagamento

1. **Criar Orçamento** - Cliente cria orçamento com itens
2. **Enviar para Cliente** - Orçamento é enviado por email
3. **Cliente Aceita** - Cliente assina o contrato digitalmente
4. **Gerar Sinal** - Sistema cria fatura de 50% no Stripe
5. **Pagamento Sinal** - Cliente paga via Stripe
6. **Gerar Saldo** - Sistema cria fatura dos 50% restantes
7. **Pagamento Saldo** - Cliente paga o valor restante
8. **Projeto Concluído** - Status atualizado automaticamente

## Taxa da Plataforma

O sistema cobra 6% de taxa sobre cada pagamento processado via Stripe Connect. Esta taxa é configurada automaticamente usando `application_fee_amount`.

## Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Executar em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Executar build de produção
npm run lint         # Executar linter
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Sincronizar schema com banco
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados de teste
```

### Estrutura do Banco

O banco de dados inclui tabelas para:
- Organizações e membros
- Clientes
- Orçamentos e itens
- Contratos e assinaturas
- Faturas e pagamentos
- Webhooks do Stripe

## Suporte

Para dúvidas ou problemas, consulte a documentação do Stripe Connect ou abra uma issue no repositório.

## Licença

MIT License
