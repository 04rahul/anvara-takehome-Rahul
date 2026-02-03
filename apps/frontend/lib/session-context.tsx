'use client';

import { createContext, useContext } from 'react';
import type { SessionData } from './auth-helpers';

interface SessionContextType {
  sessionData: SessionData;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ 
  children, 
  sessionData 
}: { 
  children: React.ReactNode; 
  sessionData: SessionData;
}) {
  return (
    <SessionContext.Provider value={{ sessionData }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context.sessionData;
}
