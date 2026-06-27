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
        // TODO: Temporary Rose Review Mode. Remove after Command Center role-based auth is finalized.
        CCA_REVIEW_MODE: "true",
        CCA_REVIEW_MODE_EXPIRES_AT: "2026-07-04T12:00:00Z",
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
