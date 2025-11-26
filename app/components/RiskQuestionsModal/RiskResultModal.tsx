"use client";

import { useMemo, useState, useEffect, useContext } from "react";
import ModalClose from "../ModalCloseButton.tsx/ModalClose";
import { GlobalContext } from "@/app/context/GlobalContext";

interface RiskResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  // riskScore: number | null;
}

interface RiskProfile {
  title: string;
  color: string;
  iconPath: React.ReactNode;
  characteristics: string[];
}

const RISK_PROFILES: Record<string, RiskProfile> = {
  low: {
    title: "Low Risk Profile",
    color: "text-green-400",
    iconPath: (
      <img
        src="https://unpkg.com/emoji-datasource-google/img/google/64/1f9d8.png"
        alt="🧘"
        className="w-16 h-16"
      />
    ),
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
    iconPath: (
      <img
        src="https://unpkg.com/emoji-datasource-google/img/google/64/1f60e.png"
        alt="😎"
        className="w-16 h-16"
      />
    ),
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
    iconPath: (
      <img
        src="https://unpkg.com/emoji-datasource-google/img/google/64/1f608.png"
        alt="😈"
        className="w-16 h-16"
      />
    ),
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
  if (score <= 360) return "low";
  if (score >= 361 && score <= 485) return "moderate";
  if (score >= 486) return "high";
  return null;
};

const RiskResultModal: React.FC<RiskResultModalProps> = ({
  isOpen,
  onClose,
  // riskScore,
}) => {
  const { state } = useContext(GlobalContext);
  const { riskScore } = state;
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
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-[#2BC6FF]/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(43,198,255,0.3)]">
        <div className="flex items-center justify-end mb-2">
          <ModalClose onClose={onClose} />
        </div>
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-[#2BC6FF]/30 border-t-[#2BC6FF] rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#00FFFF] rounded-full animate-spin"
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
                {/* <svg
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
                </svg> */}
                {riskProfile?.iconPath}
                <h3 className={`text-lg font-semibold ${riskProfile?.color}`}>
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
