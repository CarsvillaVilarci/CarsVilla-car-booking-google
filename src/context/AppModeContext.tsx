import React, { createContext, useContext, useState } from 'react';

export type AppMode = 'rider' | 'partner';

interface AppModeState {
  mode: AppMode;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeState | undefined>(undefined);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('rider');

  function toggleMode() {
    setMode((m) => (m === 'rider' ? 'partner' : 'rider'));
  }

  return <AppModeContext.Provider value={{ mode, toggleMode }}>{children}</AppModeContext.Provider>;
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}
