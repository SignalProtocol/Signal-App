"use client";
import { useEffect, useState, useCallback } from "react";
import PaymentModal from "./components/PaymentModal";
import StatsOverview from "./components/Stats/StatsOverview";
import TradingCards from "./components/DexTips/TradingCards";
import RiskQuestionsModal from "./components/RiskQuestionsModal/RiskQuestionsModal";
import RiskResultModal from "./components/RiskQuestionsModal/RiskResultModal";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import Header from "./components/DexHeader/Header";
import axios from "axios";

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [unlockedCards, setUnlockedCards] = useState<number[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showRiskQuestionModal, setShowRiskQuestionModal] = useState(true);
  const [showRiskResultModal, setShowRiskResultModal] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(500);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleUnlock = (index: number) => {
    setSelectedCard(index);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedCard !== null) {
      setUnlockedCards((prev) => [...prev, selectedCard]);
    }
    setShowPaymentModal(false);
  };

  const cards = [
    {
      token: "SHIB.USDC",
      entry: "$0.285 - $0.295",
      tp1: "$0.520 (+28%)",
      tp2: "$0.380 (+76%)",
      tp3: "$0.345 (-26%)",
      tp4: "$0.310 (-40%)",
      tp5: "$0.290 (-2%)",
      sl: "$0.21 (-26.3%)",
      leverage: "50x",
      holding: "4 - 14 hours",
      long: true,
      short: false,
      instrument: "future",
      positionSize: "10",
    },
    {
      token: "BTC.USDT",
      entry: "$65,500 - $66,200",
      tp1: "$68,000 (+3%)",
      tp2: "$70,000 (+6%)",
      tp3: "$72,000 (+9%)",
      tp4: "$0.310 (-40%)",
      tp5: "$0.290 (-2%)",
      sl: "$64,000 (-2%)",
      leverage: "10x",
      holding: "12 - 24 hours",
      long: false,
      short: true,
      instrument: "future",
      positionSize: "10",
    },
    {
      token: "ETH.USDT",
      entry: "$3,100 - $3,150",
      tp1: "$3,400 (+9%)",
      tp2: "$3,600 (+15%)",
      tp3: "$3,800 (+22%)",
      tp4: "$0.310 (-40%)",
      tp5: "$0.290 (-2%)",
      sl: "$3,000 (-4%)",
      leverage: "20x",
      holding: "6 - 12 hours",
      long: true,
      short: false,
      instrument: "future",
      positionSize: "10",
    },
    {
      token: "ADA.USDT",
      entry: "$1.20 - $1.25",
      tp1: "$1.40 (+12%)",
      tp2: "$1.55 (+24%)",
      tp3: "$1.70 (+36%)",
      tp4: "$0.310 (-40%)",
      tp5: "$0.290 (-2%)",
      sl: "$1.10 (-12%)",
      leverage: "15x",
      holding: "8 - 16 hours",
      long: true,
      short: false,
      instrument: "future",
      positionSize: "10",
    },
    {
      token: "XRP.USDT",
      entry: "$0.75 - $0.80",
      tp1: "$0.90 (+12.5%)",
      tp2: "$1.00 (+25%)",
      tp3: "$1.10 (+37.5%)",
      tp4: "$0.310 (-40%)",
      tp5: "$0.290 (-2%)",
      sl: "$0.70 (-12.5%)",
      leverage: "25x",
      holding: "10 - 20 hours",
      long: true,
      short: false,
      instrument: "future",
      positionSize: "10",
    },
    {
      token: "SOL.USDT",
      entry: "$150 - $155",
      tp1: "$170 (+12.9%)",
      tp2: "$185 (+19.4%)",
      tp3: "$200 (+29%)",
      tp4: "$0.310 (-40%)",
      tp5: "$0.290 (-2%)",
      sl: "$140 (-9.7%)",
      leverage: "30x",
      holding: "5 - 15 hours",
      long: true,
      short: false,
      instrument: "future",
      positionSize: "10",
    },
  ];

  const fetchTokenBalance = async () => {
    if (!publicKey || !connection) {
      // Clear displayed token balance when wallet disconnects
      setTokenBalance(null);
      return;
    }

    try {
      // derive ATA (Associated Token Account)
      const TOKEN_MINT = new PublicKey(
        "EEMZhENRymuN2TViQC1ijSmuEk3XnC1unkog8fERp7Eh"
      );
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      setWalletAddress(publicKey.toBase58());

      // fetch token account details
      const accountInfo = await getAccount(connection, ata);
      setTokenBalance(Number(accountInfo?.amount) / Math.pow(10, 9));
    } catch (error) {
      console.log("Token account may not exist:", error);
      setTokenBalance(0); // user doesn't have this token yet
    }
  };

  useEffect(() => {
    fetchTokenBalance();
  }, [publicKey, connection]);

  const getUserProfileAPICall = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://signal-pipeline.up.railway.app/getuserprofile?wallet_address=${walletAddress}`
      );
      const data = response.data;
      if (data.unlockedCards && Array.isArray(data.unlockedCards)) {
        setUnlockedCards(data.unlockedCards);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setShowRiskQuestionModal(true)
    }
  }, [walletAddress]);

  useEffect(() => {
    getUserProfileAPICall();
  }, [walletAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0f] to-black text-white flex flex-col">
      {/* Top Bar */}
      <Header tokenBalance={tokenBalance} />

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 py-6 p-10 overflow-y-auto">
          {/* First Division - Stats Overview */}
          <StatsOverview />

          {/* Second Division (Cards Section) */}
          <TradingCards
            cards={cards}
            unlockedCards={unlockedCards}
            onUnlock={handleUnlock}
          />
        </main>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        cardIndex={selectedCard ?? 0}
        tokenBalance={tokenBalance}
        walletAddress={walletAddress}
      />

      <RiskQuestionsModal
        isOpen={showRiskQuestionModal}
        onClose={() => setShowRiskQuestionModal(false)}
        riskScore={riskScore}
        setRiskScore={setRiskScore}
        setShowRiskResultModal={setShowRiskResultModal}
        walletAddress={walletAddress}
      />

      <RiskResultModal
        isOpen={showRiskResultModal}
        onClose={() => setShowRiskResultModal(false)}
        riskScore={riskScore}
      />
    </div>
  );
};

export default Dashboard;
