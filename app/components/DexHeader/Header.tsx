"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMixpanel } from "../../context/MixpanelContext";

const Header = ({
  setShowRiskQuestionModal,
}: {
  setShowRiskQuestionModal?: (show: boolean) => void;
}) => {
  const { state } = useContext(GlobalContext);
  const { tokenBalance, riskScore, userProfileStatus } = state;
  const { connected, publicKey } = useWallet();
  const { trackEvent } = useMixpanel();
  const prevConnectedRef = useRef<boolean>(false);
  const walletAddressRef = useRef<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenRiskQuestionModal = () => {
    if (setShowRiskQuestionModal) {
      setShowRiskQuestionModal(true);
    }
    setMobileMenuOpen(false);
    trackEvent("User opened Risk Question Modal to change the risk profile", {
      walletAddress: publicKey?.toBase58(),
      timestamp: new Date().toISOString(),
      reason: "User wants to change risk profile",
    });
  };

  // Track wallet connection and disconnection
  useEffect(() => {
    const currentWalletAddress = publicKey?.toBase58();

    // Store the current wallet address when connected
    if (connected && currentWalletAddress) {
      walletAddressRef.current = currentWalletAddress;
    }

    if (connected && !prevConnectedRef.current) {
      // Wallet connected
      trackEvent("Wallet Connected", {
        walletAddress: currentWalletAddress,
        timestamp: new Date().toISOString(),
      });
    } else if (!connected && prevConnectedRef.current) {
      // Wallet disconnected - use the stored wallet address
      trackEvent("Wallet Disconnected", {
        walletAddress: walletAddressRef.current,
        timestamp: new Date().toISOString(),
      });
      // Clear the stored address after disconnection
      walletAddressRef.current = null;
    }

    prevConnectedRef.current = connected;
  }, [connected, publicKey, trackEvent]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const RiskProfileButton = () => {
    if (
      !connected ||
      !riskScore ||
      riskScore === 0 ||
      userProfileStatus === 404
    ) {
      return null;
    }

    let emoji = "";
    let label = "";

    if (riskScore <= 360) {
      emoji =
        "https://unpkg.com/emoji-datasource-google/img/google/64/1f9d8.png";
      label = "Low Risk";
    } else if (riskScore >= 361 && riskScore <= 485) {
      emoji =
        "https://unpkg.com/emoji-datasource-google/img/google/64/1f60e.png";
      label = "Medium Risk";
    } else {
      emoji =
        "https://unpkg.com/emoji-datasource-google/img/google/64/1f608.png";
      label = "High Risk";
    }

    return (
      <div className="relative group">
        <button
          className="cursor-pointer"
          onClick={() => handleOpenRiskQuestionModal()}
        >
          <img src={emoji} alt={label} className="w-6 h-6" />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700 z-[110]">
          {label}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <header
        className="flex items-center justify-between px-4 md:px-6 py-2 border-b border-[#1f1f25] bg-[#0e0e12]/80 backdrop-blur-xl shadow-lg"
        style={{ zIndex: 100 }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Signal402"
            className="w-28 md:w-32"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {tokenBalance !== null && tokenBalance !== undefined ? (
            <div className="p-2 px-4 text-sm font-light rounded-full border-3 border-cyan-500/50 bg-[#1f1f25] transition-all duration-300 text-white">
              Bal:{" "}
              <b className="gradient-text-color font-semibold">
                {tokenBalance} $SIGNAL
              </b>
            </div>
          ) : null}

          <RiskProfileButton />

          <div className="flex items-center gap-2 px-1 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
          <WalletMultiButton className="text-sm" style={{ height: "38px" }} />
        </div>

        {/* Mobile Menu - Live Indicator + Hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
          <button
            className="p-2 text-white hover:text-cyan-400 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-72 bg-[#0e0e12] border-l border-[#1f1f25] shadow-2xl z-[201] md:hidden animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1f1f25]">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-4">
              {/* Wallet Button */}
              <div className="w-full">
                <WalletMultiButton
                  className="w-full text-sm"
                  style={{ height: "38px", width: "100%" }}
                />
              </div>

              {/* Balance */}
              {tokenBalance !== null && tokenBalance !== undefined ? (
                <div className="p-3 px-4 text-sm font-light rounded-lg border border-cyan-500/50 bg-[#1f1f25] text-white text-center">
                  <div className="text-xs text-gray-400 mb-1">Balance</div>
                  <b className="gradient-text-color font-semibold text-base">
                    {tokenBalance} $SIGNAL
                  </b>
                </div>
              ) : null}

              {/* Risk Profile */}
              {connected &&
                riskScore &&
                riskScore !== 0 &&
                userProfileStatus !== 404 && (
                  <button
                    className="w-full p-3 px-4 rounded-lg border border-[#2a2a33] bg-[#1a1a1f] hover:bg-[#1f1f25] transition-colors text-white"
                    onClick={() => handleOpenRiskQuestionModal()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-xs text-gray-400 mb-1">
                          Risk Profile
                        </div>
                        <div className="font-semibold">
                          {riskScore <= 360
                            ? "Low Risk"
                            : riskScore >= 361 && riskScore <= 485
                            ? "Medium Risk"
                            : "High Risk"}
                        </div>
                      </div>
                      <img
                        src={
                          riskScore <= 360
                            ? "https://unpkg.com/emoji-datasource-google/img/google/64/1f9d8.png"
                            : riskScore >= 361 && riskScore <= 485
                            ? "https://unpkg.com/emoji-datasource-google/img/google/64/1f60e.png"
                            : "https://unpkg.com/emoji-datasource-google/img/google/64/1f608.png"
                        }
                        alt="Risk"
                        className="w-8 h-8"
                      />
                    </div>
                  </button>
                )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
