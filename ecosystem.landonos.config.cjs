/** PM2 — CCA Command Center API (canonical config for landon.cagteam.net). */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "landonos-api",
      cwd: path.join(__dirname),
      script: "pnpm",
      args: "start:api",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      max_restarts: 10,
      min_uptime: "10s",
      autorestart: true,
    },
  ],
};

// Set DATABASE_URL on the server before starting (never commit real values):
//   export DATABASE_URL='postgres://USER:PASSWORD@127.0.0.1:5432/landonos'
//   pm2 start ecosystem.landonos.config.cjs
//   pm2 save
