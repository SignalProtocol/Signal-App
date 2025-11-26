"use client";
import { useState, useEffect, useContext } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  getAccount,
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import axios from "axios";
import ModalClose from "./ModalCloseButton.tsx/ModalClose";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GlobalContext } from "../context/GlobalContext";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  cardIndex: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  cardIndex,
}: PaymentModalProps) {
  const { state, dispatch } = useContext(GlobalContext);
  const { cardUUID, txSignature, tokenBalance, unLockedCards } = state;
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [initialPaymentResponse, setInitiatePaymentResponse] =
    useState<any>(null);

  // Method inspired by index.ts sendPaymentWithSeed - adapted for browser wallet
  const handlePayAndGetMessage = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);

    try {
      // Check SOL balance
      // const lamports = await connection.getBalance(publicKey);

      // Generate a unique reference for this payment (similar to invoice reference)
      const reference = initialPaymentResponse?.reference;
      const mintPk = new PublicKey(
        initialPaymentResponse?.payment_instruction?.usdc_mint
      );
      const recipientPk = new PublicKey(
        initialPaymentResponse?.payment_instruction?.send_to
      );

      const senderATA = await getAssociatedTokenAddress(
        mintPk,
        publicKey,
        true
      );

      const recipientATA = await getAssociatedTokenAddress(
        mintPk,
        recipientPk,
        true
      );

      // Check if sender has USDC
      try {
        const senderTokenAccount = await getAccount(connection, senderATA);
        const balance = Number(senderTokenAccount.amount);

        if (
          balance < initialPaymentResponse?.payment_instruction?.amount_usdc
        ) {
          throw new Error("Insufficient USDC balance");
        }
      } catch (err: any) {
        if (err.message.includes("Insufficient")) throw err;
        throw new Error(
          "You don't have a USDC account. Please get some devnet USDC first."
        );
      }

      // Build transaction instructions
      const instructions: TransactionInstruction[] = [];

      // Check if recipient ATA exists, create it idempotently if needed
      try {
        await getAccount(connection, recipientATA);
      } catch (err) {
        instructions.push(
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey, // payer
            recipientATA,
            recipientPk, // Use PublicKey object, not string
            mintPk // Use PublicKey object, not string
          )
        );
      }

      // Add transferChecked instruction (more robust than basic transfer)
      const decimals = 6; // USDC decimals
      const amountInSmallestUnit = Math.round(
        initialPaymentResponse?.payment_instruction?.amount_usdc *
          Math.pow(10, decimals)
      );

      instructions.push(
        createTransferCheckedInstruction(
          senderATA,
          mintPk, // Use PublicKey object, not string
          recipientATA,
          publicKey,
          amountInSmallestUnit,
          decimals
        )
      );

      // Add memo instruction with reference (similar to index.ts approach)
      const memoIx = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(reference, "utf8"),
      });
      instructions.push(memoIx);

      // Create and send transaction
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      await waitForFinalization(signature, 20000, 1200);

      // setTxSignature(signature);
      dispatch({ type: "SET_TX_SIGNATURE", payload: signature });

      // Now make the final API call with the transaction signature
      await makeFinalPaymentAPICall(signature);
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Payment failed"
      );
    } finally {
      setError("");
      setLoading(false);
      dispatch({ type: "SET_TX_SIGNATURE", payload: "" });
    }
  };

  // Wait for transaction finalization (adapted from index.ts)
  const waitForFinalization = async (
    signature: string,
    timeoutMs: number = 20000,
    intervalMs: number = 1000
  ) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const statusResponse = await connection.getSignatureStatuses([signature]);
      const status = statusResponse?.value?.[0];

      if (
        status &&
        (status.confirmationStatus === "finalized" ||
          status.confirmations === null)
      ) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return false;
  };

  const initiatePayment = async () => {
    setLoading(true);
    if (!cardUUID) return;

    try {
      await axios.get(
        `https://signal-pipeline.up.railway.app/signal/${cardUUID}?network=devnet`
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setInitiatePaymentResponse(err.response?.data);
      } else {
        setInitiatePaymentResponse({ error: String(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  const makeFinalPaymentAPICall = async (signature: string) => {
    try {
      const response = await axios.get(
        `https://signal-pipeline.up.railway.app/signal/${cardUUID}?network=devnet&reference=${initialPaymentResponse?.reference}&tx_sig=${signature}`
      );

      // The response data is the trading signal itself, not wrapped in trading_signal
      const tradingSignal = response?.data;
      const tradingSIgnalTime = response.headers["date"];
      const unix = new Date(tradingSIgnalTime).getTime(); // in milliseconds
      const unixSeconds = Math.floor(unix / 1000); // in seconds

      // Create the new unlocked card with time
      const newUnlockedCard = { ...tradingSignal, time: unixSeconds };
      const updatedUnlockedCards = [...(unLockedCards || []), newUnlockedCard];

      // Add the unlocked card to the array
      dispatch({
        type: "SET_UNLOCKED_CARDS",
        payload: updatedUnlockedCards,
      });

      // Store in localStorage
      localStorage.setItem(
        "unlockedCards",
        JSON.stringify(updatedUnlockedCards)
      );

      // Format a message from the trading signal data
      const message = `${tradingSignal.action} ${tradingSignal.pair} at ${tradingSignal.leverage} leverage`;

      // After successful transaction, clear error and set loading to false
      setError("");
      setLoading(false);

      // Call onSuccess but don't close modal - let user close it manually
      onSuccess(message);
    } catch (err: any) {
      console.error("❌ Error fetching trading signal:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch trading signal"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    cardUUID && initiatePayment();
  }, [cardUUID]); // Depend directly on cardUUID - simpler and more explicit

  if (!isOpen) return null;

  if (!connected) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-cyan-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(0,255,255,0.3)] text-center">
          <div className="flex items-center justify-end mb-6">
            <ModalClose onClose={onClose} />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              Connect your Solana wallet to unlock exclusive trading signals.
            </p>
            <WalletMultiButton className="!w-full !py-2 !px-6 !rounded-lg !font-semibold !transition-all !bg-gradient-to-r !from-cyan-600 !to-cyan-500 hover:!from-cyan-700 hover:!to-cyan-600 !shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:!shadow-[0_0_30px_rgba(0,255,255,0.6)]">
              Connect Wallet
            </WalletMultiButton>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-cyan-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-cyan-400 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1s",
                }}
              ></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {initialPaymentResponse?.payment_instruction?.amount_usdc
                ? "Processing the transaction."
                : "Setting up your transaction"}
            </h3>
            <p className="text-gray-400">
              {initialPaymentResponse?.payment_instruction?.amount_usdc
                ? "Please approve in your wallet."
                : "Please wait..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-cyan-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        {tokenBalance && tokenBalance >= 69 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Unlock Trading Signal
              </h2>
              <ModalClose onClose={onClose} />
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Pay{" "}
                <span className="text-cyan-400 font-bold">
                  {initialPaymentResponse?.payment_instruction?.amount_usdc}
                </span>{" "}
                USDC on Solana devnet to unlock this exclusive trading signal
                with detailed entry points, take profit targets, and stop loss
                levels.
              </p>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-cyan-300 mb-1">
                      Payment Details:
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • Amount:{" "}
                        {
                          initialPaymentResponse?.payment_instruction
                            ?.amount_usdc
                        }{" "}
                        USDC
                      </li>
                      <li>• Network: Solana Devnet</li>
                      <li>• Instant verification via x402 protocol</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePayAndGetMessage()}
              disabled={!connected || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all mb-4 ${
                !connected || loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"
              }`}
            >
              {loading
                ? "Processing Payment..."
                : !connected
                ? "Connect Wallet First"
                : `Pay ${initialPaymentResponse?.payment_instruction?.amount_usdc} USDC & Unlock Signal`}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {txSignature && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-4">
                <p className="text-green-400 text-sm mb-2 font-semibold">
                  ✅ Transaction Confirmed!
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 hover:text-green-200 text-xs break-all underline"
                >
                  View on Solana Explorer
                </a>
              </div>
            )}

            {!connected && (
              <p className="text-center text-gray-400 text-sm">
                Please connect your Solana wallet to continue
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="w-full flex justify-end">
              <ModalClose onClose={onClose} />
            </div>
            <div className="flex items-center justify-center p-0 mt-6 h-[200px]">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 flex items-center justify-center border border-cyan-500/30">
                  <svg
                    className="w-8 h-8 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Trading Cards Locked
                  </h3>
                  <p className="text-sm text-gray-400">
                    Please hold at least{" "}
                    <span className="text-cyan-400 font-semibold">
                      69 $SIGNAL
                    </span>{" "}
                    tokens to unlock trading tip cards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
