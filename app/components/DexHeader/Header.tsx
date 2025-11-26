"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { useWallet } from "@solana/wallet-adapter-react";

const Header = ({
  setShowRiskQuestionModal,
}: {
  setShowRiskQuestionModal: (show: boolean) => void;
}) => {
  const { state } = useContext(GlobalContext);
  const { tokenBalance, riskScore, userProfileStatus } = state;
  const { connected } = useWallet();

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 py-2 border-b border-[#1f1f25] bg-[#0e0e12]/80 backdrop-blur-xl shadow-lg"
      style={{ zIndex: 100 }}
    >
      <div className="flex items-center gap-3">
        <img src="/images/logo.png" alt="Signal Protocol" className="w-28 md:w-32" />
      </div>
      <div className="flex items-center gap-4">
        {tokenBalance !== null && tokenBalance !== undefined ? (
          <div className="p-2 px-4 text-sm font-light rounded-full border-3 border-cyan-500/50 bg-[#1f1f25] transition-all duration-300 text-white">
            Bal: <b className="gradient-text-color font-semibold">{tokenBalance} $SIGNAL</b>
          </div>
        ) : null}

        {connected ? (
          !riskScore ||
          riskScore === 0 ||
          userProfileStatus === 404 ? null : riskScore <= 360 ? (
            <div className="relative group">
              <button
                className="cursor-pointer"
                onClick={() => setShowRiskQuestionModal(true)}
              >
                <img
                  src="https://unpkg.com/emoji-datasource-google/img/google/64/1f9d8.png"
                  alt="🧘"
                  className="w-6 h-6"
                />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700">
                Low Risk
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          ) : riskScore >= 361 && riskScore <= 485 ? (
            <div className="relative group">
              <button
                className="cursor-pointer"
                onClick={() => setShowRiskQuestionModal(true)}
              >
                <img
                  src="https://unpkg.com/emoji-datasource-google/img/google/64/1f60e.png"
                  alt="😎"
                  className="w-6 h-6"
                />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700">
                Medium Risk
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <button
                className="cursor-pointer"
                onClick={() => setShowRiskQuestionModal(true)}
              >
                <img
                  src="https://unpkg.com/emoji-datasource-google/img/google/64/1f608.png"
                  alt="😈"
                  className="w-6 h-6"
                />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700">
                High Risk
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          )
        ) : null}
        <div className="hidden md:flex items-center gap-2 px-1 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
        <WalletMultiButton className="text-sm" style={{ height: "38px" }} />
      </div>
    </header>
  );
};

export default Header;
