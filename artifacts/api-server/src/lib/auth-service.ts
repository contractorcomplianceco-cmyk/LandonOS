import { eq, and, desc, sql } from "drizzle-orm";
import { db, sessions, users, workspaces, type UserRow } from "@workspace/db";
import { EMPTY_WORKSPACE_DATA } from "./default-workspace-data";
import { hashPassword, hashToken, newId, newSessionToken, verifyPassword } from "./crypto";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type PublicUser = {
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

function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
  };
}

export async function pingDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<{ user: PublicUser; sessionToken: string; activeWorkspaceId: string }> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    throw new Error("email_taken");
  }

  const userId = newId();
  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      email,
      passwordHash,
      displayName: input.displayName.trim() || email.split("@")[0],
      role: "member",
    })
    .returning();

  const workspaceId = newId();
  await db.insert(workspaces).values({
    id: workspaceId,
    ownerId: userId,
    name: "My Cockpit",
    data: EMPTY_WORKSPACE_DATA,
  });

  const sessionToken = await createSession(userId);
  return { user: toPublicUser(user), sessionToken, activeWorkspaceId: workspaceId };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: PublicUser; sessionToken: string; activeWorkspaceId: string | null }> {
  const normalized = email.trim().toLowerCase();
  const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("invalid_credentials");
  }

  const sessionToken = await createSession(user.id);
  const list = await listWorkspacesForUser(user.id);
  const activeWorkspaceId = list[0]?.id ?? null;
  return { user: toPublicUser(user), sessionToken, activeWorkspaceId };
}

async function createSession(userId: string): Promise<string> {
  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    id: newId(),
    userId,
    tokenHash,
    expiresAt,
  });

  return token;
}

export async function logoutSession(token: string | null): Promise<void> {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export async function resolveSession(token: string | null): Promise<PublicUser | null> {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const rows = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.session.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, row.session.id));
    return null;
  }

  return toPublicUser(row.user);
}

export async function listWorkspacesForUser(userId: string): Promise<WorkspaceSummary[]> {
  const rows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, userId))
    .orderBy(desc(workspaces.updatedAt));

  return rows.map((w) => ({
    id: w.id,
    name: w.name,
    updatedAt: w.updatedAt.toISOString(),
  }));
}

export async function createWorkspaceForUser(userId: string, name: string): Promise<WorkspaceSummary> {
  const id = newId();
  const [row] = await db
    .insert(workspaces)
    .values({
      id,
      ownerId: userId,
      name: name.trim() || "New Workspace",
      data: EMPTY_WORKSPACE_DATA,
    })
    .returning();

  return { id: row.id, name: row.name, updatedAt: row.updatedAt.toISOString() };
}

export async function getOwnedWorkspace(userId: string, workspaceId: string) {
  const rows = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveOwnedWorkspace(userId: string, workspaceId: string, data: unknown) {
  const existing = await getOwnedWorkspace(userId, workspaceId);
  if (!existing) return null;

  const [row] = await db
    .update(workspaces)
    .set({ data, updatedAt: new Date() })
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
    .returning();

  return row;
}

export async function clearOwnedWorkspaceData(userId: string, workspaceId: string) {
  return saveOwnedWorkspace(userId, workspaceId, EMPTY_WORKSPACE_DATA);
}

export async function deleteOwnedWorkspace(userId: string, workspaceId: string) {
  const existing = await getOwnedWorkspace(userId, workspaceId);
  if (!existing) return false;
  await db
    .delete(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)));
  return true;
}

const REVIEW_USER_EMAIL = "rose-review@internal.cagteam.local";

/** Rose Review Mode — shared review user for live persistence without a login wall. */
export async function ensureReviewSession(): Promise<{
  user: PublicUser;
  sessionToken: string;
  activeWorkspaceId: string;
}> {
  const rows = await db.select().from(users).where(eq(users.email, REVIEW_USER_EMAIL)).limit(1);
  let userRow: UserRow;

  if (rows[0]) {
    userRow = rows[0];
  } else {
    const userId = newId();
    const passwordHash = await hashPassword(newSessionToken());
    const [created] = await db
      .insert(users)
      .values({
        id: userId,
        email: REVIEW_USER_EMAIL,
        passwordHash,
        displayName: "Rose Review",
        role: "review",
      })
      .returning();
    userRow = created;
    const workspaceId = newId();
    await db.insert(workspaces).values({
      id: workspaceId,
      ownerId: userId,
      name: "Rose Review Workspace",
      data: EMPTY_WORKSPACE_DATA,
    });
  }

  let list = await listWorkspacesForUser(userRow.id);
  if (list.length === 0) {
    const created = await createWorkspaceForUser(userRow.id, "Rose Review Workspace");
    list = [created];
  }

  const sessionToken = await createSession(userRow.id);
  return {
    user: toPublicUser(userRow),
    sessionToken,
    activeWorkspaceId: list[0]!.id,
  };
}
