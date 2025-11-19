"use client";
import { useEffect, useState, useCallback, useContext, useMemo } from "react";
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
import { GlobalContext } from "./context/GlobalContext";

const Dashboard = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { riskScore, userProfileStatus } = state;
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const WALLETADDRESS = useMemo(
    () => publicKey?.toBase58() || null,
    [publicKey]
  );
  // const [unlockedCards, setUnlockedCards] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showRiskQuestionModal, setShowRiskQuestionModal] = useState(false);
  const [showRiskResultModal, setShowRiskResultModal] = useState(false);
  // const [riskScore, setRiskScore] = useState<number | null>(500);
  // const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  // const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [streamedSignals, setStreamedSignals] = useState<any[]>([]);
  // const [txSignature, setTxSignature] = useState<string>("");
  // const [getCardUUID, setGetCardUUID] = useState<string>("");
  // const [userProfileStatus, setUserProfileStatus] = useState<number>(0);

  const handleUnlock = (index: number, uuid: "") => {
    setSelectedCard(index);
    setShowPaymentModal(true);
    // setGetCardUUID(uuid);
    dispatch({ type: "SET_CARD_UUID", payload: uuid });
  };

  const handlePaymentSuccess = () => {
    // No need to add card here - PaymentModal already handles it via setUnlockedCards
    setShowPaymentModal(false);
  };

  const fetchTokenBalance = async () => {
    if (!publicKey || !connection) {
      // Clear displayed token balance when wallet disconnects
      // setTokenBalance(null);
      dispatch({ type: "SET_TOKEN_BALANCE", payload: null });
      return;
    }

    try {
      // derive ATA (Associated Token Account)
      const TOKEN_MINT = new PublicKey(
        "EEMZhENRymuN2TViQC1ijSmuEk3XnC1unkog8fERp7Eh"
      );
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      // setWalletAddress(publicKey.toBase58());

      // fetch token account details
      const accountInfo = await getAccount(connection, ata);
      // setTokenBalance(Number(accountInfo?.amount) / Math.pow(10, 9));
      dispatch({
        type: "SET_TOKEN_BALANCE",
        payload: Number(accountInfo?.amount) / Math.pow(10, 9),
      });
    } catch (error) {
      // setTokenBalance(0); // user doesn't have this token yet
      dispatch({ type: "SET_TOKEN_BALANCE", payload: 0 });
    }
  };

  const getUserProfileAPICall = async () => {
    if (!WALLETADDRESS) return;
    
    try {
      const response = await axios.get(
        `https://signal-pipeline.up.railway.app/getuserprofile?wallet_address=${WALLETADDRESS}`
      );
      const data = response.data;
      dispatch({ type: "SET_RISK_SCORE", payload: data?.risk_score });
      if (data?.unlockedCards && Array.isArray(data?.unlockedCards)) {
        // setUnlockedCards(data.unlockedCards);
        dispatch({ type: "SET_UNLOCKED_CARDS", payload: data?.unlockedCards });
      }
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        axios.isAxiosError(error) && error?.response?.status
      );
      // setShowRiskQuestionModal(true);
      if (axios.isAxiosError(error) && error?.response?.status === 404) {
        setShowRiskQuestionModal(true);
        dispatch({ type: "SET_USER_PROFILE_STATUS", payload: 404 });
      }
    }
  };

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
    dispatch({ type: "SET_USER_PROFILE_STATUS", payload: 0 });
    getUserProfileAPICall();
  }, [WALLETADDRESS]);

  useEffect(() => {
    if (riskScore !== null && riskScore !== 0 && WALLETADDRESS !== null) {
      // Clear previous signals when risk score changes
      setStreamedSignals([]);

      const abortController = new AbortController();
      getSignalsFromStreams(abortController.signal);

      // Cleanup: abort the stream when component unmounts or riskScore changes
      return () => {
        abortController.abort();
      };
    }
  }, [riskScore, getSignalsFromStreams, WALLETADDRESS]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0f] to-black text-white flex flex-col">
      {/* Top Bar */}
      <Header setShowRiskQuestionModal={setShowRiskQuestionModal} />

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 p-4 lg:py-6 lg:p-8 overflow-y-auto">
          {/* First Division - Stats Overview */}
          <StatsOverview />

          {/* Second Division (Cards Section) */}
          {connected ? (
            <TradingCards
              cards={streamedSignals}
              // unlockedCards={unlockedCards}
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
        // tokenBalance={tokenBalance}
        // tokenBalance={tokenBalance}
        // txSignature={txSignature}
        // setTxSignature={setTxSignature}
        // uuid={getCardUUID}
        // setUnlockedCards={setUnlockedCards}
      />

      <RiskQuestionsModal
        isOpen={showRiskQuestionModal}
        onClose={() => setShowRiskQuestionModal(false)}
        setShowRiskResultModal={setShowRiskResultModal}
      />
      

      <RiskResultModal
        isOpen={showRiskResultModal}
        onClose={() => setShowRiskResultModal(false)}
        // riskScore={riskScore}
      />
    </div>
  );
};

export default Dashboard;
