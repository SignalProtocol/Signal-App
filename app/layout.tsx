import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "./config/solana";
import WalletContextProvider from "./components/WalletContextProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import GlobalProvider from "./context/GlobalContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signal Protocol",
  description: "Professional trading signals dashboard",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/favicon/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <GlobalProvider>
          <WalletContextProvider>
            <SolanaWalletProvider>{children}</SolanaWalletProvider>
          </WalletContextProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
