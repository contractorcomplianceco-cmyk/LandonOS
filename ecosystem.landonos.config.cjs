/** PM2 — CCA Command Center API (canonical config for landon.cagteam.net). */
const fs = require("fs");
const path = require("path");

const repoRoot = __dirname;

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

module.exports = {
  apps: [
    {
      name: "landonos-api",
      cwd: repoRoot,
      script: "pnpm",
      args: "start:api",
      env: {
        ...loadEnvFile(path.join(repoRoot, ".env")),
        NODE_ENV: "production",
        PORT: "8084",
        // TODO: Temporary Rose Review Mode. Remove after Command Center role-based auth is finalized.
        CCA_REVIEW_MODE: "true",
        CCA_REVIEW_MODE_EXPIRES_AT: "2026-07-04T12:00:00Z",
        // HTTPS live on landon.cagteam.net — Secure cookies required.
        COOKIE_SECURE: "true",
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
