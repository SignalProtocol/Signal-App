import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Initialize Solana connection (devnet)
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const RECIPIENT_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_RECIPIENT_WALLET!
);
const USDC_MINT_DEVNET = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT_DEVNET!
);

// Payment amount: 1 USDC (6 decimals)
const PAYMENT_AMOUNT = 100_000; // 0.1 USDC

// Parse payment header manually
function parsePaymentHeader(header: string) {
  try {
    const parts = header.split(":");
    if (parts.length !== 6 || parts[0] !== "solana") {
      throw new Error("Invalid payment header format");
    }
    return {
      chain: parts[0],
      recipient: parts[1],
      mint: parts[2],
      amount: parseInt(parts[3]),
      signature: parts[4],
      network: parts[5],
    };
  } catch (error) {
    console.error("Error parsing payment header:", error);
    throw new Error("Failed to parse payment header");
  }
}

// Verify payment transaction
async function verifyPayment(
  signature: string,
  recipientWallet: PublicKey,
  mintAddress: PublicKey,
  expectedAmount: number
): Promise<boolean> {
  try {
    // Get transaction details
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx) {
      console.error("Transaction not found");
      return false;
    }

    // Check if transaction was successful
    if (tx.meta?.err) {
      console.error("Transaction failed:", tx.meta.err);
      return false;
    }

    // Get recipient's associated token account
    const recipientATA = await getAssociatedTokenAddress(
      mintAddress,
      recipientWallet
    );

    // Check pre and post token balances
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    // Find the recipient's token account in the balances
    const recipientATAString = recipientATA.toString();

    const preBalance = preBalances.find(
      (b) =>
        b.owner === recipientWallet.toString() &&
        b.mint === mintAddress.toString()
    );
    const postBalance = postBalances.find(
      (b) =>
        b.owner === recipientWallet.toString() &&
        b.mint === mintAddress.toString()
    );

    if (!postBalance) {
      console.error("Could not find recipient in post-balances");
      return false;
    }

    // Calculate the amount transferred
    const preAmount = preBalance
      ? parseInt(preBalance.uiTokenAmount.amount)
      : 0;
    const postAmount = parseInt(postBalance.uiTokenAmount.amount);
    const transferredAmount = postAmount - preAmount;

    // Verify the correct amount was transferred
    if (transferredAmount >= expectedAmount) {
      console.log("✅ Payment verified successfully");
      return true;
    } else {
      console.error("❌ Insufficient transfer amount");
      return false;
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the payment header
    const paymentHeader = request.headers.get("X-402-Payment");

    if (!paymentHeader) {
      return NextResponse.json(
        {
          error: "Payment required",
          message: "Missing X-402-Payment header",
        },
        { status: 402 }
      );
    }

    // Parse the payment header
    const payment = parsePaymentHeader(paymentHeader);

    // Validate payment details
    if (payment.recipient !== RECIPIENT_WALLET.toString()) {
      return NextResponse.json(
        {
          error: "Invalid recipient",
          message: "Payment was not sent to the correct recipient",
        },
        { status: 400 }
      );
    }

    if (payment.mint !== USDC_MINT_DEVNET.toString()) {
      return NextResponse.json(
        {
          error: "Invalid token",
          message: "Payment must be made in USDC",
        },
        { status: 400 }
      );
    }

    if (payment.amount !== PAYMENT_AMOUNT) {
      return NextResponse.json(
        {
          error: "Invalid amount",
          message: `Payment amount must be ${PAYMENT_AMOUNT / 100_000} USDC`,
        },
        { status: 400 }
      );
    }

    if (payment.network !== "devnet") {
      return NextResponse.json(
        {
          error: "Invalid network",
          message: "Payment must be on devnet",
        },
        { status: 400 }
      );
    }

    // Verify the payment transaction on-chain
    const isValid = await verifyPayment(
      payment.signature,
      RECIPIENT_WALLET,
      USDC_MINT_DEVNET,
      PAYMENT_AMOUNT
    );

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          message: "Could not verify the payment transaction on-chain",
        },
        { status: 402 }
      );
    }

    // Payment verified! Return the premium content
    return NextResponse.json({
      success: true,
      message:
        "🎉 Congratulations! You have unlocked the premium trading signal. This exclusive tip is backed by our advanced AI analysis and has a high probability of success. Trade wisely!",
      signature: payment.signature,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to process payment",
      },
      { status: 500 }
    );
  }
}
