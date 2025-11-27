"use client";

import React, { useState, useContext } from "react";
import ModalClose from "../ModalCloseButton.tsx/ModalClose";
import { useWallet } from "@solana/wallet-adapter-react";
import { GlobalContext } from "../../context/GlobalContext";

interface DexLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DexOption {
  id: string;
  name: string;
  logo: string;
  url: string;
}

const DEX_OPTIONS: DexOption[] = [
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    logo: "https://app.hyperliquid.xyz/favicon-32x32.png",
    url: "https://app.hyperliquid.xyz/trade",
  },
  {
    id: "lighter",
    name: "Lighter",
    logo: "https://app.lighter.xyz/favicon-32x32.png",
    url: "https://app.lighter.xyz/trade",
  },
  {
    id: "asterdex",
    name: "AsterDEX",
    logo: "https://static.asterindex.com/cloud-futures/static/images/aster/logo.svg",
    url: "https://www.asterdex.com/en/futures/v1",
  },
  {
    id: "uniswap",
    name: "Uniswap",
    logo: "https://cryptologos.cc/logos/uniswap-uni-logo.svg",
    url: "https://app.uniswap.org",
  },
  {
    id: "pancakeswap",
    name: "PancakeSwap",
    logo: "https://pancakeswap.finance/logo.png",
    url: "https://pancakeswap.finance",
  },
  {
    id: "raydium-perps",
    name: "Raydium Perps",
    logo: "https://avatars.githubusercontent.com/u/78411976?s=200&v=4",
    url: "https://perps.raydium.io/perp",
  },
  {
    id: "jupiter-perps",
    name: "Jupiter Perps",
    logo: "https://jup.ag/svg/jupiter-logo.svg",
    url: "https://jup.ag/perps",
  },
];

const DexLinksModal: React.FC<DexLinksModalProps> = ({ isOpen, onClose }) => {
  const { connected } = useWallet();
  const [selectedDex, setSelectedDex] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!connected) return null;

  const handleDexSelect = (dexId: string, dexUrl: string) => {
    setSelectedDex(dexId);
    localStorage.setItem("selectedDex", dexUrl);
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-cyan-500/30 rounded-xl max-w-xl w-full p-5 shadow-[0_0_50px_rgba(0,255,255,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Choose your Dex</h2>
          <ModalClose onClose={onClose} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {DEX_OPTIONS.map((dex) => (
            <div
              key={dex.id}
              onClick={() => handleDexSelect(dex.id, dex.url)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                selectedDex === dex.id
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-gray-700/50 bg-gray-800/30 hover:border-cyan-500/50 hover:bg-gray-800/50"
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 p-1.5 flex-shrink-0">
                <img
                  src={dex.logo}
                  alt={`${dex.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='12'/%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {dex.name}
                </h3>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedDex === dex.id
                    ? "border-cyan-500 bg-cyan-500"
                    : "border-gray-500"
                }`}
              >
                {selectedDex === dex.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDex}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              selectedDex
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-cyan-500/50"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DexLinksModal;
