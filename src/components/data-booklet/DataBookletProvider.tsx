"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface DataBookletContextType {
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  subject: string | null;
  setSubject: (subject: string | null) => void;
}

const DataBookletContext = createContext<DataBookletContextType | null>(null);

export const useDataBooklet = () => {
  const context = useContext(DataBookletContext);
  if (!context) {
    throw new Error('useDataBooklet must be used within DataBookletProvider');
  }
  return context;
};

export function DataBookletProvider({ children }: { children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [subject, setSubject] = useState<string | null>(null);

  const toggleMinimized = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  return (
    <DataBookletContext.Provider value={{
      isMinimized,
      setIsMinimized,
      toggleMinimized,
      isVisible,
      setIsVisible,
      subject,
      setSubject
    }}>
      {children}
    </DataBookletContext.Provider>
  );
}