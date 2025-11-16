"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Header = ({ tokenBalance }: { tokenBalance: number | null }) => {
  return (
    <header
      className="flex items-center justify-between px-6 py-2 border-b border-[#1f1f25] bg-[#0e0e12]/80 backdrop-blur-xl shadow-lg"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <div className="absolute inset-0.5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TP</span>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Signal Protocol
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Dashboard
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {tokenBalance !== null && tokenBalance !== undefined ? (
  <div className="p-2 px-4 text-sm font-light rounded-full border-2 border-indigo-500/50 bg-[#1f1f25] transition-all duration-300">
    Bal: <b>{tokenBalance} $SIGNAL</b>
  </div>
) : null}


        <div className="hidden md:flex items-center gap-2 px-1 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
        <WalletMultiButton style={{ height: "38px" }} />
      </div>
    </header>
  );
};

export default Header;
