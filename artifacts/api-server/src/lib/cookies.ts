import type { CookieOptions, Response } from "express";

export const SESSION_COOKIE = "landonos_session";
export const WORKSPACE_COOKIE = "landonos_workspace";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function cookieBase(): CookieOptions {
  // Pre-TLS cutover: set COOKIE_SECURE=false so sessions work over HTTP on the Command Center host.
  const secure = process.env.COOKIE_SECURE === "true" ? true : process.env.COOKIE_SECURE === "false" ? false : process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_MS,
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, cookieBase());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function setWorkspaceCookie(res: Response, workspaceId: string) {
  res.cookie(WORKSPACE_COOKIE, workspaceId, cookieBase());
}

export function clearWorkspaceCookie(res: Response) {
  res.clearCookie(WORKSPACE_COOKIE, { path: "/" });
}

export function readCookie(req: { cookies?: Record<string, string> }, name: string): string | null {
  const value = req.cookies?.[name];
  return typeof value === "string" && value.length > 0 ? value : null;
}
