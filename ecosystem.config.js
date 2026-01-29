module.exports = {
  apps: [{
    name: 'calculate-salary',
    script: 'npm',
    args: 'run preview',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
