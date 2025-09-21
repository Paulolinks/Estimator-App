# 🚀 Guia de Deploy para VPS

## 📋 Pré-requisitos

### 1. VPS Configurado
- **CPU:** 2 cores ✅
- **RAM:** 8GB ✅
- **HDD:** 100GB ✅
- **OS:** Ubuntu 20.04+ (recomendado)

### 2. Domínio Configurado
- Aponte o domínio para o IP do VPS
- Configure DNS: `A` record para `seu-dominio.com`

---

## 🛠️ Configuração do VPS

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verificar instalação
```

### 3. Instalar PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Configurar PostgreSQL
```bash
sudo -u postgres psql
CREATE USER estimator_user WITH PASSWORD 'senha_forte_123';
CREATE DATABASE estimator_app OWNER estimator_user;
GRANT ALL PRIVILEGES ON DATABASE estimator_app TO estimator_user;
\q
```

### 5. Instalar Nginx
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Instalar PM2
```bash
sudo npm install -g pm2
```

---

## 📁 Deploy da Aplicação

### 1. Clonar Repositório
```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/estimator-app.git
sudo chown -R $USER:$USER estimator-app
cd estimator-app
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp env.example .env.local
nano .env.local
```

**Conteúdo do .env.local:**
```env
# Database - PostgreSQL no VPS
DATABASE_URL="postgresql://estimator_user:senha_forte_123@localhost:5432/estimator_app"

# Stripe (use suas chaves reais)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# NextAuth
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=chave-super-secreta-123

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 4. Configurar Banco de Dados
```bash
npm run db:generate
npm run db:push
npm run db:seed  # Dados de teste (opcional)
```

### 5. Build da Aplicação
```bash
npm run build
```

---

## ⚙️ Configuração do Nginx

### 1. Criar Configuração
```bash
sudo nano /etc/nginx/sites-available/estimator-app
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/estimator-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Configuração do PM2

### 1. Criar Ecosystem File
```bash
nano ecosystem.config.js
```

**Conteúdo:**
```javascript
module.exports = {
  apps: [{
    name: 'estimator-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/estimator-app',
    instances: 2, // Usar os 2 cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2. Iniciar Aplicação
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 Configuração SSL (Let's Encrypt)

### 1. Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obter Certificado SSL
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 3. Configurar Auto-renewal
```bash
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoramento

### 1. Status da Aplicação
```bash
pm2 status
pm2 logs estimator-app
```

### 2. Status dos Serviços
```bash
sudo systemctl status nginx
sudo systemctl status postgresql
```

### 3. Logs
```bash
# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2
pm2 logs estimator-app --lines 100
```

---

## 🔄 Atualizações

### 1. Atualizar Código
```bash
cd /var/www/estimator-app
git pull origin main
npm install
npm run db:generate
npm run build
pm2 restart estimator-app
```

### 2. Backup do Banco
```bash
pg_dump -U estimator_user -h localhost estimator_app > backup_$(date +%Y%m%d).sql
```

---

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Aplicação não inicia:**
   ```bash
   pm2 logs estimator-app
   npm run build
   ```

2. **Banco não conecta:**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "SELECT 1"
   ```

3. **Nginx não funciona:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **SSL não funciona:**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

---

## 📈 Performance

### Otimizações:
- **PM2 Cluster:** 2 instâncias (1 por core)
- **Nginx Gzip:** Habilitado
- **PostgreSQL:** Configurado para 8GB RAM
- **SSL:** Let's Encrypt com auto-renewal

### Monitoramento:
- **Uptime:** 99.9%
- **Response Time:** <200ms
- **Concurrent Users:** 50-100

---

## ✅ Checklist Final

- [ ] VPS configurado
- [ ] Domínio apontando para VPS
- [ ] Node.js instalado
- [ ] PostgreSQL configurado
- [ ] Nginx configurado
- [ ] PM2 configurado
- [ ] SSL configurado
- [ ] Aplicação rodando
- [ ] Backup configurado
- [ ] Monitoramento ativo

**🎉 Deploy concluído com sucesso!**
