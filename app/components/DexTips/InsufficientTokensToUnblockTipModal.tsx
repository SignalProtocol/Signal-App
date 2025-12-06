"use client";

import React, { useContext } from "react";
import ModalClose from "../ModalCloseButton.tsx/ModalClose";
import { useWallet } from "@solana/wallet-adapter-react";
import { GlobalContext } from "../../context/GlobalContext";
import { useMixpanel } from "../../context/MixpanelContext";

interface InsufficientTokensToUnblockTipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsufficientTokensToUnblockTipModal: React.FC<
  InsufficientTokensToUnblockTipModalProps
> = ({ isOpen, onClose }) => {
  const { connected } = useWallet();
  const { state } = useContext(GlobalContext);
  const { tokenBalance } = state;

  if (!isOpen) return null;

  if (!connected) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-[#2BC6FF]/30 rounded-xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(43,198,255,0.3)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Insufficient Tokens
            </h2>
          </div>
          <ModalClose onClose={onClose} />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              Your token balance is low to unlock this tip. Please top up
              your tokens to continue.
            </p>
          </div>

          {/* Current Balance Display */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Current Balance</span>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-semibold font-mono">
                  {tokenBalance?.toFixed(2) || "0.00"}
                </span>
                <span className="text-gray-500 text-sm">USDC</span>
              </div>
            </div>
          </div>

          {/* Tip Pricing Tiers */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Tip Unlock Tiers</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-[#2BC6FF]/30 transition-colors">
                <span className="text-[#2BC6FF] font-mono font-semibold">69 $SIGNAL</span>
                <span className="text-gray-300">1 Tip</span>
              </li>
              <li className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-[#2BC6FF]/30 transition-colors">
                <span className="text-[#2BC6FF] font-mono font-semibold">420 $SIGNAL</span>
                <span className="text-gray-300">2 Tips</span>
              </li>
              <li className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-[#2BC6FF]/30 transition-colors">
                <span className="text-[#2BC6FF] font-mono font-semibold">1,008 $SIGNAL</span>
                <span className="text-gray-300">3 Tips</span>
              </li>
              <li className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-[#2BC6FF]/30 transition-colors">
                <span className="text-[#2BC6FF] font-mono font-semibold">10,008 $SIGNAL</span>
                <span className="text-gray-300">4 Tips</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-[#2BC6FF] to-[#00FFFF] text-black hover:shadow-lg hover:shadow-[#2BC6FF]/30 transition-all duration-200 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientTokensToUnblockTipModal;
