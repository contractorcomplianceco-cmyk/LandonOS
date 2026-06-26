import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  activateWorkspaceRequest,
  checkApiHealth,
  createWorkspaceRequest,
  fetchAuthSession,
  loginRequest,
  logoutRequest,
  registerRequest,
  type AuthSession,
  type AuthUser,
  type WorkspaceSummary,
} from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string | null;
  authLoading: boolean;
  apiAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (id: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applySession(setters: {
  setUser: (u: AuthUser | null) => void;
  setWorkspaces: (w: WorkspaceSummary[]) => void;
  setActiveWorkspaceId: (id: string | null) => void;
}, session: AuthSession | null) {
  if (!session) {
    setters.setUser(null);
    setters.setWorkspaces([]);
    setters.setActiveWorkspaceId(null);
    return;
  }
  setters.setUser(session.user);
  setters.setWorkspaces(session.workspaces);
  setters.setActiveWorkspaceId(session.activeWorkspaceId);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  const refreshSession = useCallback(async () => {
    const up = await checkApiHealth();
    setApiAvailable(up);
    if (!up) {
      applySession({ setUser, setWorkspaces, setActiveWorkspaceId }, null);
      return;
    }
    const session = await fetchAuthSession();
    applySession({ setUser, setWorkspaces, setActiveWorkspaceId }, session);
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setAuthLoading(false));
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    const session = await loginRequest(email, password);
    applySession({ setUser, setWorkspaces, setActiveWorkspaceId }, session);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const session = await registerRequest(email, password, displayName);
    applySession({ setUser, setWorkspaces, setActiveWorkspaceId }, session);
  };

  const logout = async () => {
    await logoutRequest();
    applySession({ setUser, setWorkspaces, setActiveWorkspaceId }, null);
  };

  const switchWorkspace = async (id: string) => {
    const activeId = await activateWorkspaceRequest(id);
    setActiveWorkspaceId(activeId);
  };

  const createWorkspace = async (name: string) => {
    const result = await createWorkspaceRequest(name);
    setWorkspaces((prev) => [result.workspace, ...prev]);
    setActiveWorkspaceId(result.activeWorkspaceId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspaceId,
        authLoading,
        apiAvailable,
        login,
        register,
        logout,
        switchWorkspace,
        createWorkspace,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
