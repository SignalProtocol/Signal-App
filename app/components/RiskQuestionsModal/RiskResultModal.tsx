"use client";

import { useMemo, useState, useEffect } from "react";
import ModalClose from "../ModalCloseButton.tsx/ModalClose";

interface RiskResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskScore: number | null;
}

interface RiskProfile {
  title: string;
  color: string;
  iconPath: string;
  characteristics: string[];
}

const RISK_PROFILES: Record<string, RiskProfile> = {
  low: {
    title: "Low Risk Profile",
    color: "text-green-400",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    characteristics: [
      "Conservative crypto investor with limited risk tolerance",
      "Prefers established coins (BTC/ETH) with minimal leverage",
      "Long-term horizon (5-10+ years)",
      "Limited crypto allocation (5-15% of net worth)",
      "Prioritizes capital preservation and security",
    ],
  },
  moderate: {
    title: "Moderate Risk Profile",
    color: "text-yellow-400",
    iconPath:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    characteristics: [
      "Balanced crypto investor with moderate risk appetite",
      "Mix of established and emerging altcoins",
      "Comfortable with 3-5x leverage on select positions",
      "Moderate crypto allocation (15-30% of net worth)",
      "Can handle 40-60% drawdowns emotionally",
    ],
  },
  high: {
    title: "High Risk Profile",
    color: "text-red-400",
    iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    characteristics: [
      "Aggressive crypto trader seeking maximum returns",
      "Actively uses leverage (10x-100x+) on futures",
      "Significant crypto allocation (30-50%+ of net worth)",
      "Can absorb 70%+ portfolio volatility",
      "Extensive trading experience (3+ years)",
    ],
  },
};

const getRiskProfileType = (score: number): string | null => {
  if (score >= 270 && score <= 360) return "low";
  if (score >= 361 && score <= 485) return "moderate";
  if (score >= 486 && score <= 610) return "high";
  return null;
};

const RiskResultModal: React.FC<RiskResultModalProps> = ({
  isOpen,
  onClose,
  riskScore,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const riskProfile = useMemo(() => {
    if (riskScore === null) return null;
    const profileType = getRiskProfileType(riskScore);
    return profileType ? RISK_PROFILES[profileType] : null;
  }, [riskScore]);

  useEffect(() => {
    if (isOpen && riskScore !== null) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, riskScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-indigo-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
        <div className="flex items-center justify-end mb-2">
          <ModalClose onClose={onClose} />
        </div>
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1s",
                }}
              ></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analysing your score</h3>
            <p className="text-gray-400">Please wait...</p>
          </div>
        ) : riskProfile ? (
          <div className="text-gray-300 space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex flex-col items-center justify-center w-full">
                <svg
                  className={`w-15 h-15 ${riskProfile?.color}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={riskProfile?.iconPath}
                  />
                </svg>
                <h3
                  className={`text-lg font-semibold ${riskProfile?.color}`}
                >
                  {riskProfile?.title}
                </h3>
              </div>
            </div>
            <ul className="list-none mt-2 space-y-1">
              {riskProfile?.characteristics.map((characteristic, index) => (
                <li
                  key={index}
                  className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2"
                >
                  {characteristic}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-gray-300 text-center py-8">
            <p className="text-lg">No risk profile data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskResultModal;
