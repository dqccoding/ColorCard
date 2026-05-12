import { createContext, useContext } from 'react';

const CanvasStateContext = createContext(null);

export function CanvasStateProvider({ children, value }) {
  return (
    <CanvasStateContext.Provider value={value}>
      {children}
    </CanvasStateContext.Provider>
  );
}

export function useCanvasState() {
  const ctx = useContext(CanvasStateContext);
  if (!ctx) throw new Error('useCanvasState must be used within CanvasStateProvider');
  return ctx;
}
