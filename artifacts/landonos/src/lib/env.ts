/** Runtime feature flags derived from env vars. Safe defaults let the app run without any .env file. */

export const env = {
  /** True when no live OpenAI key is configured — AI surfaces use local mock responses. */
  demoMode: !import.meta.env.VITE_OPENAI_API_KEY,
  appEnv: import.meta.env.VITE_APP_ENV ?? "local",
  baseUrl: import.meta.env.BASE_URL ?? "/",
  /** Optional API base URL. Empty = same origin (/api via Vite proxy or nginx). */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  /** Optional write key sent as X-API-Key when API_KEY is set on the server. */
  apiKey: import.meta.env.VITE_API_KEY ?? "",
} as const;

export const PRODUCTION_ENV_VARS = [
  "DATABASE_URL — Postgres connection for api-server (required for live persistence)",
  "PORT — api-server listen port (default 3001; nginx proxies /api)",
  "NODE_ENV — set production on VPS (secure session cookies)",
  "API_KEY — optional server write protection (pair with VITE_API_KEY in the SPA build)",
  "VITE_API_BASE_URL — API origin for SPA (empty = same-origin /api)",
  "VITE_API_KEY — client key for PUT/DELETE when API_KEY is enabled",
  "VITE_APP_ENV — environment label (local | staging | production)",
  "BASE_PATH — deploy base path (default /)",
  "VITE_OPENAI_API_KEY — enable live AI chat (RoseOS Co-Driver, Prompt Coach)",
] as const;
