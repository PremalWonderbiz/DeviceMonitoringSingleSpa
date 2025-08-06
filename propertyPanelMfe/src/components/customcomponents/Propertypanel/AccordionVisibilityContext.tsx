import React, { createContext, useContext, useState } from "react";

type AccordionContextType = {
  state: Record<string, boolean>;
  register: (path: string, isOpen: boolean) => void;
  toggle: (path: string, openOrClose : boolean) => void;
  getState: (path: string) => boolean | undefined;
};

const AccordionStateContext = createContext<AccordionContextType | null>(null);

export const AccordionStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Record<string, boolean>>({});

  const register = (path: string, isOpen: boolean) => {
    setState(prev => {
      if (path in prev) return prev;
      return { ...prev, [path]: isOpen };
    });
  };

  const toggle = (path: string, openOrClose : boolean) => {
    setState(prev => ({
      ...prev,
      [path]: openOrClose
    }));
  };

  const getState = (path: string) => {
    return state[path];
  };

  return (
    <AccordionStateContext.Provider value={{ state, register, toggle, getState }}>
      {children}
    </AccordionStateContext.Provider>
  );
};

export const useAccordionState = () => useContext(AccordionStateContext);
