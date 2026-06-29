import type { AppData } from "@/lib/types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function jsonHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  return headers;
}

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  updatedAt: string;
};

export type AuthSession = {
  user: AuthUser;
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string | null;
};

export type WorkspaceResponse = {
  workspaceId: string;
  name: string;
  data: AppData;
  updatedAt: string;
};

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const body = await res.json();
    return new Error(body.message ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/healthz"), { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAuthSession(): Promise<AuthSession | null> {
  const res = await fetch(apiUrl("/api/auth/me"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (res.status === 401) return null;
  if (!res.ok) throw await parseError(res, "Could not load session");
  return (await res.json()) as AuthSession;
}

/** Rose Review Mode — bootstrap a server session without showing a login form. */
export async function bootstrapReviewSession(): Promise<AuthSession | null> {
  const res = await fetch(apiUrl("/api/auth/review-session"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
  });
  if (res.status === 403) return null;
  if (!res.ok) throw await parseError(res, "Could not start review session");
  return (await res.json()) as AuthSession;
}

export async function loginRequest(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res, "Sign in failed");
  return (await res.json()) as AuthSession;
}

export async function registerRequest(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthSession> {
  const res = await fetch(apiUrl("/api/auth/register"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password, displayName }),
  });
  if (!res.ok) throw await parseError(res, "Registration failed");
  return (await res.json()) as AuthSession;
}

export async function logoutRequest(): Promise<void> {
  await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
  });
}

export async function createWorkspaceRequest(name: string): Promise<{
  workspace: WorkspaceSummary;
  activeWorkspaceId: string;
}> {
  const res = await fetch(apiUrl("/api/workspaces"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw await parseError(res, "Could not create workspace");
  return (await res.json()) as { workspace: WorkspaceSummary; activeWorkspaceId: string };
}

export async function activateWorkspaceRequest(id: string): Promise<AuthSession["activeWorkspaceId"]> {
  const res = await fetch(apiUrl(`/api/workspaces/${id}/activate`), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders(),
  });
  if (!res.ok) throw await parseError(res, "Could not switch workspace");
  const json = (await res.json()) as { activeWorkspaceId: string };
  return json.activeWorkspaceId;
}

export async function fetchWorkspace(): Promise<AppData | null> {
  const res = await fetch(apiUrl("/api/workspace"), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (res.status === 401 || res.status === 400) return null;
  if (res.status === 404) return null;
  if (!res.ok) throw await parseError(res, "Failed to load workspace");

  const json = (await res.json()) as WorkspaceResponse;
  return json.data;
}

export async function persistWorkspace(data: AppData): Promise<void> {
  const res = await fetch(apiUrl("/api/workspace"), {
    method: "PUT",
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res, "Failed to save workspace");
}

export async function resetWorkspaceOnServer(): Promise<AppData | null> {
  const res = await fetch(apiUrl("/api/workspace"), {
    method: "DELETE",
    credentials: "include",
    headers: jsonHeaders(),
  });
  if (!res.ok) throw await parseError(res, "Failed to reset workspace");
  const json = (await res.json()) as { data?: AppData };
  return json.data ?? null;
}
