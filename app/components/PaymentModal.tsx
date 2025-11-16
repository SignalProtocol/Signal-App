"use client";
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import axios from "axios";
import ModalClose from "./ModalCloseButton.tsx/ModalClose";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const RECIPIENT_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_RECIPIENT_WALLET!
);
const USDC_MINT_DEVNET = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT_DEVNET!
);
const PAYMENT_AMOUNT = 100_000; // 0.1 USDC

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  cardIndex: number;
  tokenBalance: number | null;
  walletAddress: string | null;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  cardIndex,
  tokenBalance,
  walletAddress,
}: PaymentModalProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [txSignature, setTxSignature] = useState<string>("");
  const { connect } = useWallet();

  const handlePayAndGetMessage = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");
    setTxSignature("");

    try {
      // Get associated token accounts
      const senderATA = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        publicKey
      );
      const recipientATA = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        RECIPIENT_WALLET
      );

      // Check if sender has USDC
      try {
        const senderTokenAccount = await getAccount(connection, senderATA);
        if (Number(senderTokenAccount.amount) < PAYMENT_AMOUNT) {
          throw new Error("Insufficient USDC balance");
        }
      } catch (err) {
        throw new Error(
          "You don't have a USDC account. Please get some devnet USDC first."
        );
      }

      // Create transfer instruction. If recipient ATA doesn't exist, create it first.
      const instructions = [] as any[];

      // If recipient ATA doesn't exist, create it (idempotent on devnet/mainnet if already exists)
      try {
        await getAccount(connection, recipientATA);
      } catch (err) {
        // Account doesn't exist; create associated token account for recipient
        instructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            recipientATA,
            RECIPIENT_WALLET,
            USDC_MINT_DEVNET
          )
        );
      }

      instructions.push(
        createTransferInstruction(
          senderATA,
          recipientATA,
          publicKey,
          PAYMENT_AMOUNT
        )
      );

      // Create and send transaction
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const transaction = new Transaction().add(...instructions);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      let signature: string;
      signature = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      setTxSignature(signature);

      // Wait a bit for transaction to propagate
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now call the API with the payment proof
      const paymentHeader = `solana:${RECIPIENT_WALLET.toString()}:${USDC_MINT_DEVNET.toString()}:${PAYMENT_AMOUNT}:${signature}:devnet`;

      const response = await axios.post(
        "/api/paid-message",
        { cardIndex },
        {
          headers: {
            "X-402-Payment": paymentHeader,
          },
          validateStatus: (status) => status < 500, // Don't throw on 4xx errors
        }
      );

      if (response.status === 200) {
        onSuccess(response.data.message);
        setLoading(false);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(response.data.message || "API call failed");
      }
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Payment failed"
      );
    }
  };

  if (!isOpen) return null;

  if (!connected) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-indigo-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] text-center">
          <div className="flex items-center justify-end mb-6">
            <ModalClose onClose={onClose} />
          </div>
            <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 text-sm mb-6">
              Connect your Solana wallet to unlock exclusive trading signals.
            </p>
            <WalletMultiButton className="!w-full !py-2 !px-6 !rounded-lg !font-semibold !transition-all !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:!shadow-[0_0_30px_rgba(99,102,241,0.6)]">
              Connect Wallet
            </WalletMultiButton>
            </div>
        </div>
      </div>
    )
  }  

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#141418] to-[#1a1a1f] border border-indigo-500/30 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
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
                Pay <span className="text-indigo-400 font-bold">0.1 USDC</span>{" "}
                on Solana devnet to unlock this exclusive trading signal with
                detailed entry points, take profit targets, and stop loss
                levels.
              </p>

              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"
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
                    <p className="font-semibold text-indigo-300 mb-1">
                      Payment Details:
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Amount: 0.1 USDC</li>
                      <li>• Network: Solana Devnet</li>
                      <li>• Instant verification via x402 protocol</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayAndGetMessage}
              disabled={!connected || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all mb-4 ${
                !connected || loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              }`}
            >
              {loading
                ? "Processing Payment..."
                : !connected
                ? "Connect Wallet First"
                : "Pay 0.1 USDC & Unlock Signal"}
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/30">
                  <svg
                    className="w-8 h-8 text-indigo-400"
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
                    <span className="text-indigo-400 font-semibold">
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
