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
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [unlockedCards, setUnlockedCards] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showRiskQuestionModal, setShowRiskQuestionModal] = useState(true);
  const [showRiskResultModal, setShowRiskResultModal] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(500);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [streamedSignals, setStreamedSignals] = useState<any[]>([]);
  const [getUserProfileStatus, setGetUserProfileStatus] = useState<
    number | null
  >(null);
  const [txSignature, setTxSignature] = useState<string>("");
  const [getCardUUID, setGetCardUUID] = useState<string>("");

  const handleUnlock = (index: number, uuid: "") => {
    setSelectedCard(index);
    setShowPaymentModal(true);
    setGetCardUUID(uuid);
  };

  const handlePaymentSuccess = () => {
    // No need to add card here - PaymentModal already handles it via setUnlockedCards
    setShowPaymentModal(false);
  };

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
      setTokenBalance(0); // user doesn't have this token yet
    }
  };

  const getUserProfileAPICall = useCallback(async () => {
    if (walletAddress === null) return;

    try {
      const response = await axios.get(
        `https://signal-pipeline.up.railway.app/getuserprofile?wallet_address=${walletAddress}`
      );
      const data = response.data;
      setGetUserProfileStatus(response?.status);
      if (data.unlockedCards && Array.isArray(data.unlockedCards)) {
        setUnlockedCards(data.unlockedCards);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setShowRiskQuestionModal(true);
    }
  }, [walletAddress]);

  const getSignalsFromStreams = useCallback(
    async (abortSignal: AbortSignal) => {
      if (!riskScore) return;

      // Map riskScore to risk level
      let riskLevel = "mid";
      if (riskScore < 400) riskLevel = "low";
      else if (riskScore > 600) riskLevel = "high";

      try {
        const response = await fetch(
          `https://signal-pipeline.up.railway.app/signal/stream?risk=${riskLevel}`,
          { signal: abortSignal }
        );

        if (!response.body) {
          console.error("No response body (stream) available.");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });

            try {
              // Parse SSE format (Server-Sent Events)
              const lines = chunk.split("\n").filter((line) => line.trim());

              lines.forEach((line) => {
                // SSE format: "data: {json}"
                if (line.startsWith("data:")) {
                  try {
                    // Remove "data: " prefix and parse JSON
                    const jsonStr = line.substring(5).trim(); // Remove "data:" prefix
                    const signal = JSON.parse(jsonStr);

                    if (signal?.uuid && signal?.pair) {
                      // Transform signal to match cards structure
                      const transformedSignal = {
                        uuid: signal.uuid || "-",
                        token: signal.pair || "-",
                        entry: "-",
                        tp1: "-",
                        tp2: "-",
                        tp3: "-",
                        tp4: "-",
                        tp5: "-",
                        sl: "-",
                        leverage: "-",
                        holding: "-",
                        long: false,
                        short: false,
                        instrument: "-",
                        positionSize: "-",
                      };

                      // Update state with new signal
                      setStreamedSignals((prev) => {
                        return [...prev, transformedSignal];
                      });
                    }
                  } catch (e) {
                    console.error(
                      "Error parsing JSON from SSE data:",
                      e,
                      "Line:",
                      line
                    );
                  }
                } else if (line.trim() && !line.startsWith(":")) {
                  // Non-empty, non-comment line that's not SSE format
                  console.warn("Unexpected line format:", line);
                }
              });
            } catch (parseError) {
              console.error("Error parsing chunk:", parseError);
            }
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
        } else {
          console.error("Error fetching signals:", error);
        }
      }
    },
    [riskScore]
  );

  useEffect(() => {
    fetchTokenBalance();
  }, [publicKey, connection]);

  useEffect(() => {
    getUserProfileAPICall();
  }, [walletAddress]);

  useEffect(() => {
    if (riskScore !== null && riskScore !== 0 && walletAddress !== null) {
      // Clear previous signals when risk score changes
      setStreamedSignals([]);

      const abortController = new AbortController();
      getSignalsFromStreams(abortController.signal);

      // Cleanup: abort the stream when component unmounts or riskScore changes
      return () => {
        abortController.abort();
      };
    }
  }, [riskScore, getSignalsFromStreams, walletAddress]);

  // useEffect(() => {
  //   getSignalsAfterPayForTip()
  // }, [txSignature])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0f] to-black text-white flex flex-col">
      {/* Top Bar */}
      <Header tokenBalance={tokenBalance} />

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 p-4 lg:py-6 lg:p-8 overflow-y-auto">
          {/* First Division - Stats Overview */}
          <StatsOverview />

          {/* Second Division (Cards Section) */}
          {connected ? (
            <TradingCards
              cards={streamedSignals}
              unlockedCards={unlockedCards}
              // unblockedSignals={unlockedCards}
              onUnlock={handleUnlock}
            />
          ) : (
            <section className="p-4 mt-8 rounded-lg border border-[#2a2a33] bg-[#0e0e12]/30 h-2/3 flex items-center  justify-center">
              <div className="text-center text-gray-400 text-lg font-semibold">
                <h1 className="mb-3">
                  Connect your wallet to view trading signals.
                </h1>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        cardIndex={selectedCard ?? 0}
        tokenBalance={tokenBalance}
        txSignature={txSignature}
        setTxSignature={setTxSignature}
        uuid={getCardUUID}
        setUnlockedCards={setUnlockedCards}
      />

      {getUserProfileStatus === 404 && (
        <RiskQuestionsModal
          isOpen={showRiskQuestionModal}
          onClose={() => setShowRiskQuestionModal(false)}
          riskScore={riskScore}
          setRiskScore={setRiskScore}
          setShowRiskResultModal={setShowRiskResultModal}
          walletAddress={walletAddress}
        />
      )}

      <RiskResultModal
        isOpen={showRiskResultModal}
        onClose={() => setShowRiskResultModal(false)}
        riskScore={riskScore}
      />
    </div>
  );
};

export default Dashboard;
