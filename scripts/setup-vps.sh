#!/bin/bash

# 🚀 Script de Setup para VPS - Estimator App
# Execute como: bash scripts/setup-vps.sh

set -e

echo "🚀 Iniciando setup do Estimator App no VPS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
fi

# 1. Atualizar sistema
log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 18+
log "Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    warning "Node.js já está instalado"
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
log "Node.js versão: $NODE_VERSION"

# 3. Instalar PostgreSQL
log "Instalando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    warning "PostgreSQL já está instalado"
fi

# 4. Configurar PostgreSQL
log "Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE USER estimator_user WITH PASSWORD 'estimator_secure_2024';" 2>/dev/null || warning "Usuário estimator_user já existe"
sudo -u postgres psql -c "CREATE DATABASE estimator_app OWNER estimator_user;" 2>/dev/null || warning "Database estimator_app já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE estimator_app TO estimator_user;"

# 5. Instalar Nginx
log "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    warning "Nginx já está instalado"
fi

# 6. Instalar PM2
log "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    warning "PM2 já está instalado"
fi

# 7. Criar diretório da aplicação
log "Criando diretório da aplicação..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# 8. Instalar dependências do projeto
log "Instalando dependências do projeto..."
npm install

# 9. Gerar cliente Prisma
log "Gerando cliente Prisma..."
npm run db:generate

# 10. Configurar banco de dados
log "Configurando banco de dados..."
npm run db:push

# 11. Build da aplicação
log "Fazendo build da aplicação..."
npm run build

# 12. Configurar Nginx
log "Configurando Nginx..."
sudo tee /etc/nginx/sites-available/estimator-app > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/estimator-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 13. Iniciar aplicação com PM2
log "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 14. Instalar Certbot para SSL
log "Instalando Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# 15. Configurar auto-renewal SSL
log "Configurando auto-renewal SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# 16. Criar script de backup
log "Criando script de backup..."
sudo tee /usr/local/bin/backup-estimator.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/estimator-app"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR
pg_dump -U estimator_user -h localhost estimator_app > \$BACKUP_DIR/backup_\$DATE.sql
find \$BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-estimator.sh

# Configurar backup diário
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-estimator.sh") | crontab -

# 17. Configurar firewall
log "Configurando firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 18. Verificar status
log "Verificando status dos serviços..."
echo "📊 Status dos Serviços:"
echo "PM2:"
pm2 status
echo ""
echo "Nginx:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "PostgreSQL:"
sudo systemctl status postgresql --no-pager -l

# 19. Informações finais
log "✅ Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo .env.local com suas variáveis"
echo "2. Configure seu domínio no DNS"
echo "3. Execute: sudo certbot --nginx -d seu-dominio.com"
echo "4. Acesse: http://seu-ip ou https://seu-dominio.com"
echo ""
echo "🔧 Comandos úteis:"
echo "pm2 status                    # Status da aplicação"
echo "pm2 logs estimator-app        # Logs da aplicação"
echo "pm2 restart estimator-app     # Reiniciar aplicação"
echo "sudo systemctl status nginx   # Status do Nginx"
echo "sudo systemctl status postgresql # Status do PostgreSQL"
echo ""
echo "📁 Arquivos importantes:"
echo ".env.local                    # Variáveis de ambiente"
echo "ecosystem.config.js           # Configuração PM2"
echo "/etc/nginx/sites-available/estimator-app # Configuração Nginx"
echo ""
log "🎉 Estimator App está pronto para uso!"
