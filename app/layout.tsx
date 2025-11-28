"use client";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "./config/solana";
import WalletContextProvider from "./components/WalletContextProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import GlobalProvider from "./context/GlobalContext";
import { MixpanelProvider } from "./context/MixpanelContext";

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
        <MixpanelProvider>
          <GlobalProvider>
            <WalletContextProvider>
              <SolanaWalletProvider>{children}</SolanaWalletProvider>
            </WalletContextProvider>
          </GlobalProvider>
        </MixpanelProvider>
      </body>
    </html>
  );
}
