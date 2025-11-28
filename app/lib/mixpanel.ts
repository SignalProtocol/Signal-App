import mixpanel, { Mixpanel } from "mixpanel-browser";

let mixpanelInstance: Mixpanel | null = null;

export const initMixpanel = () => {
  if (typeof window !== "undefined" && !mixpanelInstance) {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

    if (token) {
      try {
        mixpanel.init(token, {
          debug: process.env.NODE_ENV === "development",
          track_pageview: true,
          // Use 'cookie' for better cross-browser compatibility (especially Safari/Mac)
          // Falls back gracefully if cookies are blocked
          persistence: "cookie",
          // Ignore Do Not Track setting to ensure tracking works consistently
          ignore_dnt: true,
          // Use first-party cookies to avoid third-party cookie blocking
          cross_site_cookie: false,
          // Secure cookie settings for HTTPS
          secure_cookie: window.location.protocol === "https:",
          // Set cookie domain to current domain for better Safari compatibility
          cookie_domain: window.location.hostname,
          // Disable batch requests for more reliable tracking on all browsers
          batch_requests: false,
          // API host - use the direct Mixpanel API for better ad-blocker bypass
          api_host: "https://api-js.mixpanel.com",
        });
        mixpanelInstance = mixpanel;
      } catch (error) {
        console.warn("Failed to initialize Mixpanel:", error);
      }
    } else {
      console.warn("Mixpanel token not found. Analytics will not be tracked.");
    }
  }

  return mixpanelInstance;
};

export const getMixpanel = (): Mixpanel | null => {
  if (!mixpanelInstance && typeof window !== "undefined") {
    return initMixpanel();
  }
  return mixpanelInstance;
};

// Helper functions for common tracking operations
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  try {
    const mp = getMixpanel();
    if (mp) {
      mp.track(eventName, {
        ...properties,
        // Add OS info for debugging cross-platform issues
        $os: typeof navigator !== "undefined" ? navigator.platform : undefined,
        $browser: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
    }
  } catch (error) {
    console.warn("Failed to track event:", eventName, error);
  }
};

export const identifyUser = (
  userId: string,
  properties?: Record<string, any>
) => {
  try {
    const mp = getMixpanel();
    if (mp) {
      mp.identify(userId);
      if (properties) {
        mp.people.set(properties);
      }
    }
  } catch (error) {
    console.warn("Failed to identify user:", error);
  }
};

export const setUserProperties = (properties: Record<string, any>) => {
  try {
    const mp = getMixpanel();
    if (mp) {
      mp.people.set(properties);
    }
  } catch (error) {
    console.warn("Failed to set user properties:", error);
  }
};

export const resetUser = () => {
  try {
    const mp = getMixpanel();
    if (mp) {
      mp.reset();
    }
  } catch (error) {
    console.warn("Failed to reset user:", error);
  }
};

export default getMixpanel;
