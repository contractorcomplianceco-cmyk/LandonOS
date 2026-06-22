import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData } from '../lib/types';
import { defaultData } from '../lib/default-data';

interface AppContextType {
  data: AppData;
  updateData: (newData: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'landonos_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (!item) return defaultData;
      const parsed = JSON.parse(item);
      // Merge with defaults so data saved before a new top-level field was
      // added (e.g. announcements/admin) still loads without crashing.
      return { ...defaultData, ...parsed };
    } catch (error) {
      console.warn("Failed to read from localStorage", error);
      return defaultData;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to write to localStorage", error);
    }
  }, [data]);

  const updateData = (newData: Partial<AppData> | ((prev: AppData) => AppData)) => {
    setData((prev) => {
      const nextData = typeof newData === 'function' ? newData(prev) : { ...prev, ...newData };
      return nextData;
    });
  };

  const resetData = () => {
    setData(defaultData);
  };

  return (
    <AppContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};
