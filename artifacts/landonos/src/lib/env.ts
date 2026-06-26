/** Runtime feature flags derived from env vars. Safe defaults let the app run without any .env file. */

export const env = {
  /** True when no live OpenAI key is configured — AI surfaces use local mock responses. */
  demoMode: !import.meta.env.VITE_OPENAI_API_KEY,
  appEnv: import.meta.env.VITE_APP_ENV ?? "local",
  baseUrl: import.meta.env.BASE_URL ?? "/",
} as const;

export const PRODUCTION_ENV_VARS = [
  "VITE_OPENAI_API_KEY — enable live AI chat (RoseOS Co-Driver, Prompt Coach)",
  "DATABASE_URL — Postgres persistence (api-server scaffold, not wired to UI yet)",
  "PORT — dev/preview server port (default 5000)",
  "BASE_PATH — deploy base path (default /)",
  "VITE_APP_ENV — environment label shown in demo banner",
] as const;
