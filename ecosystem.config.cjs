module.exports = {
  apps: [
    {
      name: 'bell-coin-backend',
      script: 'server.js',
      cwd: './backend',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DATABASE_URL: 'file:./dev.db',
        FRONTEND_URL: 'http://localhost:3000' // Change to your domain (e.g., https://bellcoin.com)
      }
    },
    {
      name: 'bell-coin-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './frontend',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api/v1' // Change to your backend domain (e.g., https://api.bellcoin.com/api/v1)
      }
    }
  ]
};
