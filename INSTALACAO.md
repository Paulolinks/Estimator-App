# Instruções de Instalação - Estimator App

## ⚠️ Pré-requisitos Obrigatórios

Antes de começar, você precisa instalar:

### 1. Node.js (Obrigatório)
- Acesse: https://nodejs.org/
- Baixe a versão LTS (recomendada)
- Instale seguindo as instruções do instalador
- Verifique se foi instalado: abra o PowerShell e digite `node --version`

### 2. PostgreSQL (Obrigatório)
Escolha uma das opções:

**Opção A - Instalação Local:**
- Acesse: https://www.postgresql.org/download/
- Baixe e instale o PostgreSQL
- Crie um banco de dados chamado `estimator_app`

**Opção B - Serviço na Nuvem (Recomendado):**
- [Supabase](https://supabase.com/) - Gratuito até 500MB
- [Neon](https://neon.tech/) - Gratuito até 3GB
- [Railway](https://railway.app/) - Plano gratuito disponível

### 3. Conta Stripe (Obrigatório)
- Acesse: https://stripe.com/
- Crie uma conta gratuita
- Ative o modo de teste
- Anote suas chaves de API

## 🚀 Passos de Instalação

### 1. Instalar Dependências
Abra o PowerShell na pasta do projeto e execute:

```powershell
npm install
```

### 2. Configurar Variáveis de Ambiente
1. Copie o arquivo `env.example` para `.env.local`
2. Edite o arquivo `.env.local` com suas configurações:

```env
# Database - Substitua pela URL do seu banco
DATABASE_URL="postgresql://username:password@localhost:5432/estimator_app"

# Stripe - Substitua pelas suas chaves do Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# NextAuth - Gere uma chave secreta
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar Banco de Dados
Execute os comandos para configurar o banco:

```powershell
# Gerar cliente Prisma
npm run db:generate

# Sincronizar schema com banco
npm run db:push

# Popular com dados de teste
npm run db:seed
```

### 4. Executar o Projeto
```powershell
npm run dev
```

Acesse: http://localhost:3000

## 🔧 Configuração do Stripe

### 1. Obter Chaves de API
1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em "Desenvolvedores" > "Chaves de API"
3. Copie a "Chave secreta" (começa com `sk_test_`)

### 2. Configurar Webhooks
1. No Stripe, vá em "Desenvolvedores" > "Webhooks"
2. Clique em "Adicionar endpoint"
3. URL: `http://localhost:3000/api/stripe/webhook`
4. Selecione os eventos:
   - `invoice.finalized`
   - `invoice.paid`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o "Segredo do webhook" (começa com `whsec_`)

## 🧪 Testando o Sistema

### 1. Acessar Dashboard
- Vá para: http://localhost:3000/dashboard
- Você verá a tela inicial com instruções

### 2. Testar API
Use ferramentas como Postman ou curl para testar as rotas:

```bash
# Criar organização de teste
curl -X POST http://localhost:3000/api/connect/create-account \
  -H "Content-Type: application/json" \
  -d '{"orgId":"sua-org-id"}'
```

### 3. Verificar Banco de Dados
- Os dados de teste foram criados automaticamente
- Verifique se as tabelas foram criadas corretamente

## 🐛 Solução de Problemas

### Erro: "node não é reconhecido"
- Reinstale o Node.js
- Reinicie o PowerShell
- Verifique se o Node.js está no PATH

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Confirme a URL de conexão no `.env.local`
- Teste a conexão com um cliente PostgreSQL

### Erro: "Stripe API key invalid"
- Verifique se copiou a chave correta
- Confirme se está no modo de teste
- Verifique se não há espaços extras na chave

### Erro: "Module not found"
- Execute `npm install` novamente
- Verifique se está na pasta correta
- Limpe o cache: `npm cache clean --force`

## 📚 Próximos Passos

Após a instalação bem-sucedida:

1. **Implementar Autenticação**: Configure NextAuth com provedores
2. **Criar Interface**: Desenvolva as telas do dashboard
3. **Testar Fluxo Completo**: Crie orçamentos e processe pagamentos
4. **Configurar Produção**: Deploy para Vercel/Netlify

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no console
2. Consulte a documentação do Stripe
3. Verifique se todas as dependências estão instaladas
4. Confirme se as variáveis de ambiente estão corretas

---

**Nota**: Este é um projeto de demonstração. Para uso em produção, configure adequadamente a autenticação, segurança e monitoramento.
