# Mixpanel Integration

Mixpanel has been successfully integrated into your Next.js project.

## Setup

The Mixpanel token is stored in `.env.local`:

```
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

## Usage

### Using the Mixpanel Hook

Import and use the `useMixpanel` hook in any component:

```tsx
"use client";

import { useMixpanel } from "@/app/context/MixpanelContext";

export default function MyComponent() {
  const { trackEvent, identifyUser, setUserProperties } = useMixpanel();

  const handleButtonClick = () => {
    trackEvent("Button Clicked", {
      buttonName: "Subscribe",
      page: "Home",
    });
  };

  const handleLogin = (userId: string) => {
    identifyUser(userId, {
      name: "John Doe",
      email: "john@example.com",
    });
  };

  return <button onClick={handleButtonClick}>Click Me</button>;
}
```

### Available Methods

#### `trackEvent(eventName, properties?)`

Track custom events with optional properties:

```tsx
trackEvent("Page Viewed", { pageName: "Dashboard" });
trackEvent("Payment Completed", { amount: 100, currency: "USD" });
```

#### `identifyUser(userId, properties?)`

Identify a user and optionally set their properties:

```tsx
identifyUser("user123", {
  name: "Jane Doe",
  email: "jane@example.com",
  plan: "premium",
});
```

#### `setUserProperties(properties)`

Update user properties:

```tsx
setUserProperties({
  lastLogin: new Date().toISOString(),
  totalPurchases: 5,
});
```

#### `resetUser()`

Reset the user (useful on logout):

```tsx
resetUser();
```

### Direct Mixpanel Instance Access

If you need direct access to the Mixpanel instance:

```tsx
import { useMixpanel } from "@/app/context/MixpanelContext";

const { mixpanel } = useMixpanel();

// Use any Mixpanel method
if (mixpanel) {
  mixpanel.time_event("Video Watched");
  // ... later
  mixpanel.track("Video Watched");
}
```

### Using Utility Functions

You can also import utility functions directly:

```tsx
import { trackEvent, identifyUser } from "@/app/lib/mixpanel";

trackEvent("Custom Event", { key: "value" });
```

## Automatic Tracking

- **Page Views**: Automatically tracked when navigation occurs
- **App Loaded**: Tracked when the application first loads

## Environment Variables

- `NEXT_PUBLIC_MIXPANEL_TOKEN`: Your Mixpanel project token (required)
- `NODE_ENV`: Set to "development" to enable debug mode

## Example: Tracking Wallet Connections

```tsx
"use client";

import { useMixpanel } from "@/app/context/MixpanelContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

export default function WalletTracker() {
  const { trackEvent, identifyUser } = useMixpanel();
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      trackEvent("Wallet Connected", {
        walletAddress: publicKey.toString(),
      });

      // Optionally identify the user by wallet address
      identifyUser(publicKey.toString());
    }
  }, [connected, publicKey]);

  return null;
}
```

## Notes

- The Mixpanel instance is initialized once when the app loads
- All tracking is disabled if the `NEXT_PUBLIC_MIXPANEL_TOKEN` is not set
- In development mode, debug messages will appear in the console
