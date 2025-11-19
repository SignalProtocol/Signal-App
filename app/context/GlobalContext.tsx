"use client";

import { createContext, useReducer, Dispatch, ReactNode } from "react";
import { GlobalState, GlobalAction } from "./globalTypes";
import { globalReducer, initialState } from "./globalReducer";

interface GlobalContextType {
  state: GlobalState;
  dispatch: Dispatch<GlobalAction>;
}

export const GlobalContext = createContext<GlobalContextType>({
  state: initialState,
  dispatch: () => {},
});

export default function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}
