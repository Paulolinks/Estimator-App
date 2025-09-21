module.exports = {
  apps: [{
    name: 'estimator-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/estimator-app',
    instances: 2, // Usar os 2 cores do VPS
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/estimator-app-error.log',
    out_file: '/var/log/pm2/estimator-app-out.log',
    log_file: '/var/log/pm2/estimator-app.log',
    time: true
  }]
}
