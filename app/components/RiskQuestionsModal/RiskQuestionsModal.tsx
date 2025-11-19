"use client";

import React, { useState, useContext } from "react";
import ModalClose from "../ModalCloseButton.tsx/ModalClose";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { GlobalContext } from "../../context/GlobalContext";

interface RiskQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // riskScore: number | null;
  // setRiskScore: React.Dispatch<React.SetStateAction<number | null>>;
  setShowRiskResultModal: React.Dispatch<React.SetStateAction<boolean>>;
  // walletAddress: string | null;
}

const RiskQuestionsModal: React.FC<RiskQuestionsModalProps> = ({
  isOpen,
  onClose,
  // riskScore,
  // setRiskScore,
  setShowRiskResultModal,
  // walletAddress,
}) => {
  const { state, dispatch } = useContext(GlobalContext);
  const { riskScore } = state;
  const { connected, publicKey } = useWallet();
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});

  const instructions = {
    title: "Instructions",
    question:
      "Please answer the following questions to determine your risk profile. There are no right or wrong answers this is about understanding your comfort level with crypto market volatility and trading risk.",
  };

  const Questions = [
    {
      title: "Investment Time Horizon",
      question:
        "How long do you intend to hold your cryptocurrency investments before you need to access the funds?",
      options: [
        { option: "Less than 1 year (0-12 months)", score: 10 },
        { option: "1 to 3 years", score: 20 },
        { option: "3 to 5 years", score: 30 },
        { option: "5 to 10 years", score: 40 },
        { option: "10+ years (long-term, no planned withdrawals)", score: 50 },
      ],
    },
    {
      title: "Leverage Comfort & Portfolio Composition",
      question:
        "When considering crypto trading with leverage (futures, margin trading), what's your comfort level?",
      options: [
        {
          option:
            "I only trade spot markets with 1x leverage; no margin or futures",
          score: 5,
        },
        {
          option:
            "I'm comfortable with up to 2-3x leverage on a small portion of my portfolio",
          score: 15,
        },
        {
          option: "I can accept 5-10x leverage on select positions",
          score: 30,
        },
        { option: "I actively trade with 10-25x leverage", score: 45 },
        {
          option:
            "I'm comfortable trading at 25x-100x+ leverage; I understand forced liquidations",
          score: 50,
        },
      ],
    },
    {
      title: "Volatility Tolerance & Emotional Response",
      question:
        "Imagine your crypto portfolio drops 40% in value in a single week. What would you do?",
      options: [
        {
          option:
            "I'd panic and sell everything; I can't handle that level of loss",
          score: 5,
        },
        {
          option:
            "I'd be stressed but hold; I'd consider this a buying opportunity if the project is solid",
          score: 25,
        },
        {
          option:
            "I'd view it as normal market correction and rebalance strategically",
          score: 40,
        },
        {
          option:
            "I'd see it as an opportunity to add leverage or double down on undervalued positions",
          score: 55,
        },
        {
          option:
            "I'd be excited about the volatility and use it for active trading profits",
          score: 70,
        },
      ],
    },
    {
      title: "Downside Risk Capacity & Emergency Funds",
      question:
        "What percentage of your total liquid net worth is allocated to crypto investments?",
      options: [
        {
          option: "Less than 5% (crypto is highly speculative for me)",
          score: 15,
        },
        {
          option:
            "5-15% (moderate allocation, I have substantial emergency reserves)",
          score: 30,
        },
        {
          option:
            "15-30% (significant portion, but I maintain 6+ months of expenses in stable assets)",
          score: 45,
        },
        {
          option:
            "30-50% (major portfolio allocation, limited emergency reserves)",
          score: 60,
        },
        {
          option:
            "50%+ (majority of investments in crypto, minimal safety net)",
          score: 75,
        },
      ],
    },
    {
      title: "Knowledge & Experience in Crypto Markets",
      question:
        "How would you describe your cryptocurrency and trading knowledge?",
      options: [
        {
          option: "Beginner; I've just started learning about crypto",
          score: 10,
        },
        {
          option:
            "Basic; I understand Bitcoin, altcoins, and spot trading fundamentals",
          score: 25,
        },
        {
          option:
            "Intermediate; I understand technical analysis, DeFi, and basic leverage trading",
          score: 40,
        },
        {
          option:
            "Advanced; I understand smart contracts, liquidation mechanics, and complex trading strategies",
          score: 55,
        },
        {
          option:
            "Expert; I have 3+ years of active crypto trading experience with significant profitability",
          score: 70,
        },
      ],
    },
    {
      title: "Regulatory & Operational Risk Acceptance",
      question:
        "How would a regulatory crackdown (exchange bans, trading restrictions) affect your portfolio and strategy?",
      options: [
        {
          option:
            "I need immediate access to my funds; any regulatory risk makes me uncomfortable",
          score: 20,
        },
        {
          option:
            "I can handle short-term access delays, but need my funds within 30 days",
          score: 35,
        },
        {
          option:
            "I can accept 1-3 month fund access restrictions for a strong project",
          score: 50,
        },
        {
          option:
            "I can accept temporary exchange issues or regulatory challenges",
          score: 65,
        },
        {
          option:
            "Regulatory risk is irrelevant to my investment thesis; I accept indefinite access limitations",
          score: 80,
        },
      ],
    },
    {
      title: "Portfolio Concentration & Diversification Comfort",
      question:
        "What's your comfort level with concentrated positions in your crypto portfolio?",
      options: [
        {
          option: "I prefer 80%+ in Bitcoin/Ethereum (established coins only)",
          score: 50,
        },
        { option: "50% large-cap (BTC/ETH), 50% mid-cap altcoins", score: 40 },
        {
          option:
            "Balanced mix: 30% large-cap, 40% mid-cap, 30% small-cap/emerging tokens",
          score: 30,
        },
        {
          option:
            "20% large-cap, 30% mid-cap, 50% small-cap/emerging/high-risk tokens",
          score: 20,
        },
        {
          option:
            "I'm comfortable with 70%+ portfolio concentration in single tokens; I like asymmetric bets",
          score: 10,
        },
      ],
    },
    {
      title: "Smart Contract & Cybersecurity Risk",
      question:
        "How do you manage private keys and custody of your digital assets?",
      options: [
        {
          option:
            "I use centralized exchange custody exclusively; I trust the platform",
          score: 60,
        },
        {
          option:
            "I use hardware wallets for long-term holdings, exchange for active trading",
          score: 45,
        },
        {
          option:
            "50% hardware wallet, 50% diversified across multiple exchanges/protocols",
          score: 30,
        },
        {
          option:
            "Mostly hardware/self-custody, but I interact with DeFi protocols (lending, staking)",
          score: 20,
        },
        {
          option:
            "Active DeFi participant; I accept smart contract risks; I understand impermanent loss concepts",
          score: 10,
        },
      ],
    },
    {
      title: "Trading Strategy & Leverage Exit Risk",
      question:
        "If you're liquidated on a leveraged position, how would that impact your financial situation?",
      options: [
        {
          option:
            "A liquidation would be catastrophic; I cannot afford losses beyond 10% of my crypto allocation",
          score: 65,
        },
        {
          option:
            "A single liquidation would hurt but manageable; I can afford 20-30% loss on my crypto portfolio",
          score: 50,
        },
        {
          option:
            "I can absorb 50% losses on my crypto allocation without affecting my lifestyle",
          score: 35,
        },
        {
          option:
            "I can absorb 70%+ losses; I view them as part of aggressive trading",
          score: 20,
        },
        {
          option:
            "Liquidations are expected; I rebalance and continue; losses don't affect my long-term strategy",
          score: 10,
        },
      ],
    },
    {
      title: "Income Replacement & Risk-Return Trade-off",
      question: "What's your primary goal with crypto investments?",
      options: [
        {
          option:
            "Capital preservation; I want slow, steady growth with minimal volatility",
          score: 20,
        },
        {
          option:
            "Moderate growth; I'm willing to accept some volatility for 15-30% annual returns",
          score: 35,
        },
        {
          option:
            "Strong growth; I target 50-100% annual returns; I accept significant volatility",
          score: 50,
        },
        {
          option:
            "Aggressive returns; I target 100-500% returns; I accept extreme volatility",
          score: 65,
        },
        {
          option:
            "Wealth multiplication; I'm chasing 10x+ returns; I'm willing to lose it all for asymmetric upside",
          score: 80,
        },
      ],
    },
  ];

  const addAllRiskScores = async () => {
    const totalScore = Object.values(selectedOptions).reduce(
      (acc, score) => acc + score,
      0
    );
    // setRiskScore(totalScore);
    dispatch({ type: "SET_RISK_SCORE", payload: totalScore });
    onClose();
    setCurrentQuestion(1);
    setSelectedOptions({});
    setShowRiskResultModal(true);
    await createUserAPICall(totalScore);
  };

  const createUserAPICall = async (totalScore: number) => {
    const payload = {
      wallet_address: publicKey?.toBase58(),
      risk_score: totalScore,
    };
    try {
      await axios.post(
        "https://signal-pipeline.up.railway.app/setuserprofile",
        payload
      );
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  if (!isOpen) return null;

  if (!connected) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-indigo-500/30 rounded-xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Risk Assessment Questions
          </h2>
          <ModalClose onClose={onClose} />
        </div>

        {showInstructions ? (
          <div className="mb-6">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-6 mb-4 text-center">
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">
                {instructions.title}
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                {instructions.question}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowInstructions(false);
                    setCurrentQuestion(1);
                    setSelectedOptions({});
                  }}
                  className="px-6 py-2 text-sm rounded-md font-semibold transition-all border border-indigo-500 text-indigo-400 hover:border-indigo-400 hover:text-indigo-300 bg-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  Start
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm rounded-md font-semibold transition-all border border-gray-500 text-gray-400 hover:border-gray-400 hover:text-white bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-3 mb-4">
                <h3 className="text-md font-semibold text-indigo-300 mb-2">
                  Question {currentQuestion} of {Questions.length}:{" "}
                  {Questions[currentQuestion - 1]?.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {Questions[currentQuestion - 1]?.question}
                </p>
              </div>

              <div className="space-y-2">
                {Questions[currentQuestion - 1]?.options?.map(
                  (option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 bg-[#1a1a1f] border border-gray-700 hover:border-indigo-500/50 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer group"
                    >
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="radio"
                          value={option.option}
                          name={`question-${currentQuestion}`}
                          checked={
                            selectedOptions[currentQuestion] === option.score
                          }
                          onChange={() =>
                            setSelectedOptions({
                              ...selectedOptions,
                              [currentQuestion]: option.score,
                            })
                          }
                          className="appearance-none w-5 h-5 rounded-full border border-gray-500 bg-transparent cursor-pointer transition-all checked:border-indigo-400 checked:bg-transparent hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-0"
                        />
                        {selectedOptions[currentQuestion] === option.score && (
                          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-3 h-3 rounded-full bg-indigo-400 pointer-events-none" />
                        )}
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors text-sm flex-1">
                        {option.option}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-700">
              <button
                onClick={() =>
                  setCurrentQuestion(Math.max(1, currentQuestion - 1))
                }
                disabled={currentQuestion === 1}
                className={`px-6 py-2 text-sm rounded-md font-semibold transition-all ${
                  currentQuestion === 1
                    ? "border border-gray-500 text-gray-500 cursor-not-allowed bg-transparent"
                    : "border border-gray-400 text-gray-300 hover:border-gray-300 hover:text-white bg-transparent cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.2)"
                }`}
              >
                PREVIOUS
              </button>
              <span className="text-gray-400 text-sm">
                {currentQuestion} / {Questions.length}
              </span>
              {currentQuestion === Questions.length ? (
                <button
                  onClick={addAllRiskScores}
                  className="px-6 py-2 text-sm rounded-md font-semibold transition-all border border-indigo-500 text-indigo-400 hover:border-indigo-400 hover:text-indigo-300 bg-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  FINISH
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQuestion(
                      Math.min(Questions.length, currentQuestion + 1)
                    )
                  }
                  disabled={!selectedOptions[currentQuestion]}
                  className="px-6 py-2 text-sm rounded-md font-semibold transition-all border border-indigo-500 text-indigo-400 hover:border-indigo-400 hover:text-indigo-300 bg-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  NEXT
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiskQuestionsModal;
