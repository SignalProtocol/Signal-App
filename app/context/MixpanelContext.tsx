"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Mixpanel } from "mixpanel-browser";
import {
  initMixpanel,
  getMixpanel,
  trackEvent,
  identifyUser,
  setUserProperties,
  resetUser,
} from "../lib/mixpanel";

interface MixpanelContextType {
  mixpanel: Mixpanel | null;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  identifyUser: (userId: string, properties?: Record<string, any>) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  resetUser: () => void;
}

const MixpanelContext = createContext<MixpanelContextType | undefined>(
  undefined
);

export const useMixpanel = (): MixpanelContextType => {
  const context = useContext(MixpanelContext);
  if (!context) {
    throw new Error("useMixpanel must be used within a MixpanelProvider");
  }
  return context;
};

interface MixpanelProviderProps {
  children: ReactNode;
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    // Initialize Mixpanel on mount
    initMixpanel();

    // Track initial app load
    trackEvent("App Loaded", {
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    });
  }, []);

  const value: MixpanelContextType = {
    mixpanel: getMixpanel(),
    trackEvent,
    identifyUser,
    setUserProperties,
    resetUser,
  };

  return (
    <MixpanelContext.Provider value={value}>
      {children}
    </MixpanelContext.Provider>
  );
};
