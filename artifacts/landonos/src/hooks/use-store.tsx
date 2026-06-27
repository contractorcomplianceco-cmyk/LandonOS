import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { AppData } from "../lib/types";
import { defaultData } from "../lib/default-data";
import {
  fetchWorkspace,
  persistWorkspace,
  resetWorkspaceOnServer,
} from "../lib/api";
import { useAuth } from "./use-auth";

export type SyncMode = "loading" | "local" | "live" | "error";

interface AppContextType {
  data: AppData;
  updateData: (newData: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  resetData: () => void;
  syncMode: SyncMode;
  syncError: string | null;
  isSaving: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "landonos_data_v1";
const LEGACY_STORAGE_KEY = "landonos_data";
const SAVE_DEBOUNCE_MS = 800;

function readLocalData(): AppData {
  try {
    const item =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!item) return defaultData;
    const parsed = JSON.parse(item);
    return { ...defaultData, ...parsed };
  } catch (error) {
    console.warn("Failed to read from localStorage", error);
    return defaultData;
  }
}

function writeLocalData(data: AppData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to write to localStorage", error);
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user, activeWorkspaceId, apiAvailable, authLoading } = useAuth();
  const [data, setData] = useState<AppData>(defaultData);
  const [syncMode, setSyncMode] = useState<SyncMode>("loading");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef(false);

  const loadRemote = useCallback(async () => {
    if (authLoading) return;

    if (!apiAvailable || !user || !activeWorkspaceId) {
      setData(readLocalData());
      liveRef.current = false;
      setSyncMode("local");
      setSyncError(null);
      return;
    }

    setSyncMode("loading");
    try {
      const remote = await fetchWorkspace();
      const next = remote ? { ...defaultData, ...remote } : { ...defaultData, ...readLocalData() };
      if (!remote) {
        await persistWorkspace(next);
      }
      setData(next);
      writeLocalData(next);
      liveRef.current = true;
      setSyncMode("live");
      setSyncError(null);
    } catch (err) {
      console.warn("Workspace sync failed", err);
      setData(readLocalData());
      liveRef.current = false;
      setSyncMode("error");
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    }
  }, [apiAvailable, user, activeWorkspaceId, authLoading]);

  useEffect(() => {
    loadRemote();
  }, [loadRemote]);

  const scheduleServerSave = useCallback((next: AppData) => {
    if (!liveRef.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        await persistWorkspace(next);
        setSyncError(null);
        setSyncMode("live");
      } catch (err) {
        console.warn("Failed to persist workspace", err);
        setSyncError(err instanceof Error ? err.message : "Save failed");
        setSyncMode("error");
      } finally {
        setIsSaving(false);
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (syncMode === "loading" && authLoading) return;
    writeLocalData(data);
    scheduleServerSave(data);
  }, [data, scheduleServerSave, syncMode, authLoading]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const updateData = (newData: Partial<AppData> | ((prev: AppData) => AppData)) => {
    setData((prev) => {
      const nextData = typeof newData === "function" ? newData(prev) : { ...prev, ...newData };
      return nextData;
    });
  };

  const resetData = () => {
    const apply = (next: AppData) => {
      setData(next);
      writeLocalData(next);
    };

    if (liveRef.current) {
      resetWorkspaceOnServer()
        .then((serverData) => apply(serverData ? { ...defaultData, ...serverData } : defaultData))
        .catch((err) => {
          console.warn("Failed to reset server workspace", err);
          setSyncError(err instanceof Error ? err.message : "Reset failed");
          apply(defaultData);
        });
      return;
    }
    apply(defaultData);
  };

  return (
    <AppContext.Provider value={{ data, updateData, resetData, syncMode, syncError, isSaving }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useStore must be used within an AppProvider");
  }
  return context;
};
