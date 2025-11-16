"use client";

import ModalClose from "../ModalCloseButton.tsx/ModalClose";

interface RiskResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskScore: number | null;
}

const RiskResultModal: React.FC<RiskResultModalProps> = ({
  isOpen,
  onClose,
  riskScore,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-indigo-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
        <div className="flex items-center justify-end mb-2">
          <ModalClose onClose={onClose} />
        </div>
        <div className="text-gray-300 space-y-4">
          {riskScore !== null && riskScore >= 270 && riskScore <= 360 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex flex-col items-center justify-center w-full">
                  <svg
                    className="w-15 h-15 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-400">
                    Low Risk Profile
                  </h3>
                </div>
              </div>
              <ul className="list-none mt-2 space-y-1">
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Conservative crypto investor with limited risk tolerance
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Prefers established coins (BTC/ETH) with minimal leverage
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Long-term horizon (5-10+ years)
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Limited crypto allocation (5-15% of net worth)
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Prioritizes capital preservation and security
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="text-gray-300 space-y-4">
          {riskScore !== null && riskScore >= 361 && riskScore <= 485 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex flex-col items-center justify-center w-full">
                  <svg
                    className="w-15 h-15 text-yellow-400"
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
                  <h3 className="text-lg font-semibold text-yellow-400">
                    Moderate Risk Profile
                  </h3>
                </div>
              </div>
              <ul className="list-none mt-2 space-y-1">
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Balanced crypto investor with moderate risk appetite
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Mix of established and emerging altcoins
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Comfortable with 3-5x leverage on select positions
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Moderate crypto allocation (15-30% of net worth)
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Can handle 40-60% drawdowns emotionally
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="text-gray-300 space-y-4">
          {riskScore !== null && riskScore >= 486 && riskScore <= 610 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex flex-col items-center justify-center w-full">
                  <svg
                    className="w-15 h-15 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-400">
                    High Risk Profile
                  </h3>
                </div>
              </div>
              <ul className="list-none mt-2 space-y-1">
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Aggressive crypto trader seeking maximum returns
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Actively uses leverage (10x-100x+) on futures
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Significant crypto allocation (30-50%+ of net worth)
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Can absorb 70%+ portfolio volatility
                </li>
                <li className="bg-gray-800/30 border border-gray-700/50 rounded-md px-4 py-3 text-sm mb-2">
                  Extensive trading experience (3+ years)
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskResultModal;
