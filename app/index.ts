const axios = require("axios");
const _ES = require("eventsource");
const EventSource =
  (_ES && (_ES.default || _ES.EventSource || _ES.EventSourcePolyfill)) || _ES;
const http = require("http");
const https = require("https");
const { URL } = require("url");
const bip39 = require("bip39");
const { derivePath } = require("ed25519-hd-key");
const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  TransactionInstruction,
} = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
} = require("@solana/spl-token");
const readline = require("readline");

/**
 * Web Client for Solana Signal API
 * Demonstrates full lifecycle of calling /signal endpoint on devnet
 */

class SignalAPIClient {
  constructor(baseURL = "http://localhost:8000") {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Step 1: Request signal without payment
   * Returns invoice details for payment
   */
  async requestSignal(riskLevel = "mid", network = "devnet") {
    try {
      console.log(
        `🔍 Requesting signal for risk level: ${riskLevel} on ${network}`
      );

      const response = await this.client.get("/signal", {
        params: {
          risk: riskLevel,
          network: network,
        },
      });

      // This should not happen in normal flow
      console.log("✅ Signal received:", response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 402) {
        console.log("💳 Payment required - Invoice created");
        console.log("Invoice details:", error.response.data);
        return error.response.data;
      } else {
        console.error(
          "❌ Error requesting signal:",
          error.response?.data || error.message
        );
        throw error;
      }
    }
  }

  async waitForFinalization(
    network,
    signature,
    timeoutMs = 20000,
    intervalMs = 1000
  ) {
    const rpc =
      network === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com";
    const connection = new Connection(rpc, "confirmed");
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const st = await connection.getSignatureStatuses([signature]);
      const status = st?.value?.[0];
      const conf = status?.confirmationStatus || status?.confirmations;
      if (
        status &&
        (status.confirmationStatus === "finalized" ||
          status?.confirmations === null)
      ) {
        return true;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
  }

  /**
   * Full per-UUID flow using a real on-chain transfer from a seed phrase
   */
  async getSignalWithSeed(riskLevel = "mid", network = "devnet", mnemonic) {
    console.log("🚀 Starting per-UUID live payment flow...");
    const mined = await this.subscribeToSignalStream(riskLevel, true);
    const signalUUID = mined.uuid;
    const invoiceData = await this.requestSignalByUUID(signalUUID, network);
    if (!invoiceData.reference) {
      console.log("✅ Full signal available without payment");
      return invoiceData;
    }
    const txSig = await this.sendPaymentWithSeed(invoiceData, mnemonic);
    // Wait for finalization to ensure RPC parses instructions & memo
    const finalized = await this.waitForFinalization(
      network,
      txSig,
      20000,
      1200
    );
    if (!finalized) {
      console.warn(
        "⏳ Proceeding without finalization (may cause temporary not-detected)"
      );
    }
    // small grace delay
    await new Promise((r) => setTimeout(r, 500));
    return await this.submitPaymentForUUID(
      signalUUID,
      invoiceData.reference,
      txSig,
      network
    );
  }

  /**
   * Subscribe to server-sent events for newly mined signals
   * Resolves with the first event received if waitForOne is true
   */
  subscribeToSignalStream(risk = "mid", waitForOne = true) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}/signal/stream?risk=${encodeURIComponent(
        risk
      )}`;
      console.log(`📡 Subscribing to SSE: ${url}`);
      if (typeof EventSource === "function") {
        const es = new EventSource(url);
        const onMessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            console.log("🆕 Mined signal event:", data);
            if (waitForOne) {
              es.close();
              resolve(data);
            }
          } catch (e) {
            console.warn("⚠️ SSE parse error:", e);
          }
        };
        es.onmessage = onMessage;
        es.onerror = (err) => {
          console.error("❌ SSE error:", err);
          try {
            es.close();
          } catch {}
          reject(err);
        };
        return;
      }

      // Fallback: manual SSE over http/https
      try {
        const u = new URL(url);
        const client = u.protocol === "https:" ? https : http;
        const req = client.request(
          {
            hostname: u.hostname,
            port: u.port || (u.protocol === "https:" ? 443 : 80),
            path: u.pathname + u.search,
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              Connection: "keep-alive",
              "Cache-Control": "no-cache",
            },
          },
          (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`SSE HTTP ${res.statusCode}`));
              return;
            }
            res.setEncoding("utf8");
            let buffer = "";
            res.on("data", (chunk) => {
              buffer += chunk;
              let idx;
              while ((idx = buffer.indexOf("\n\n")) !== -1) {
                const raw = buffer.slice(0, idx);
                buffer = buffer.slice(idx + 2);
                const lines = raw.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const json = line.slice(6);
                    try {
                      const data = JSON.parse(json);
                      console.log("🆕 Mined signal event:", data);
                      if (waitForOne) {
                        req.destroy();
                        resolve(data);
                      }
                    } catch (e) {
                      // ignore malformed data lines
                    }
                  }
                }
              }
            });
            res.on("end", () => reject(new Error("SSE connection ended")));
          }
        );
        req.on("error", reject);
        req.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Request invoice for a specific signal UUID
   */
  async requestSignalByUUID(signalUUID, network = "devnet") {
    try {
      console.log(
        `🧾 Requesting invoice for signal ${signalUUID} on ${network}`
      );
      const res = await this.client.get(`/signal/${signalUUID}`, {
        params: { network },
      });
      console.log(
        "✅ Received full signal without payment (unexpected):",
        res.data
      );
      return res.data;
    } catch (error) {
      if (error.response?.status === 402) {
        console.log("💳 Payment required - Invoice created for UUID");
        console.log("Invoice details:", error.response.data);
        return error.response.data;
      }
      console.error(
        "❌ Error requesting signal by UUID:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Submit payment for a specific signal UUID and retrieve full body
   */
  async submitPaymentForUUID(signalUUID, reference, txSig, network = "devnet") {
    try {
      console.log(
        `📤 Submitting payment for ${signalUUID} with reference: ${reference}`
      );
      const res = await this.client.get(`/signal/${signalUUID}`, {
        params: { network, reference, tx_sig: txSig },
      });
      console.log("🎯 Full signal received:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Error submitting payment for UUID:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Derive a Solana Keypair from a BIP39 mnemonic (seed phrase)
   */
  async keypairFromMnemonic(mnemonic, derivationPath = "m/44'/501'/0'/0'") {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid BIP39 mnemonic");
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const { key } = derivePath(derivationPath, seed.toString("hex"));
    return Keypair.fromSeed(key);
  }

  /**
   * Send a real SPL token transfer with a Memo equal to invoice.reference
   * Returns the on-chain transaction signature
   */
  async sendPaymentWithSeed(invoiceData, mnemonic) {
    const network =
      invoiceData.network ||
      invoiceData.payment_instruction?.network ||
      "devnet";
    const rpc =
      network === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com";
    const connection = new Connection(rpc, "confirmed");

    const payer = await this.keypairFromMnemonic(mnemonic);
    console.log("🔐 Derived wallet public key:", payer.publicKey.toBase58());
    const lamports = await connection
      .getBalance(payer.publicKey)
      .catch(() => 0);
    console.log(
      "💰 SOL balance (lamports):",
      lamports,
      "(~",
      (lamports / 1e9).toFixed(6),
      "SOL )"
    );

    const reference = invoiceData.reference;
    const mintStr = invoiceData.payment_instruction.usdc_mint;
    const recipientStr = invoiceData.payment_instruction.send_to; // owner pubkey
    const amount = Number(invoiceData.payment_instruction.amount_usdc);
    const decimals = 6; // USDC/test mint typically 6

    const mint = new PublicKey(mintStr);
    const recipientOwner = new PublicKey(recipientStr);

    // Get or create ATAs
    let senderAta;
    let recipientAta;
    try {
      senderAta = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
      );
      console.log("👤 Sender ATA OK");
    } catch (e) {
      console.error("❌ Failed to get/create Sender ATA:", e?.message || e);
      throw new Error(
        "Failed to create sender ATA (insufficient SOL for rent or bad mint)"
      );
    }
    // Recipient may be a PDA (off-curve). Derive ATA allowing off-curve owner and create idempotently if missing.
    try {
      const recipientAtaAddress = await getAssociatedTokenAddress(
        mint,
        recipientOwner,
        true // allowOwnerOffCurve
      );
      const info = await connection.getAccountInfo(recipientAtaAddress);
      if (!info) {
        const createIx = createAssociatedTokenAccountIdempotentInstruction(
          payer.publicKey,
          recipientAtaAddress,
          recipientOwner,
          mint
        );
        const txCreate = new Transaction().add(createIx);
        await sendAndConfirmTransaction(connection, txCreate, [payer]);
        console.log("🏦 Recipient ATA created idempotently");
      } else {
        console.log("🏦 Recipient ATA exists");
      }
      // normalize shape to match getOrCreate return object
      recipientAta = { address: recipientAtaAddress };
    } catch (e) {
      console.error("❌ Failed to ensure Recipient ATA:", e?.message || e);
      throw new Error(
        "Failed to ensure recipient ATA (owner off-curve or insufficient SOL)"
      );
    }

    // Preflight: show balances and addresses
    const senderBalance = await connection
      .getTokenAccountBalance(senderAta.address)
      .catch(() => null);
    console.log(
      "👛 Sender ATA:",
      senderAta.address.toBase58(),
      "balance:",
      senderBalance?.value?.uiAmountString ?? "unknown"
    );
    console.log("📥 Recipient ATA:", recipientAta.address.toBase58());

    // Build transferChecked instruction
    const amountInSmallest = BigInt(Math.round(amount * 10 ** decimals));
    const transferIx = createTransferCheckedInstruction(
      senderAta.address,
      mint,
      recipientAta.address,
      payer.publicKey,
      Number(amountInSmallest),
      decimals
    );

    // Memo instruction (program id fixed)
    const MEMO_PROGRAM_ID = new PublicKey(
      "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
    );
    const memoIx = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(reference, "utf8"),
    });

    const tx = new Transaction().add(transferIx, memoIx);
    tx.feePayer = payer.publicKey;
    try {
      const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
      console.log("✅ On-chain tx signature:", sig);
      return sig;
    } catch (err) {
      console.error(
        "❌ sendAndConfirmTransaction failed:",
        err?.message || err
      );
      if (err?.logs) console.error("🪵 Logs:", err.logs);
      throw err;
    }
  }

  /**
   * Step 2: Simulate USDC payment (in real app, this would be actual Solana transaction)
   * For demo purposes, we'll simulate the payment with a mock transaction signature
   */
  async simulateUSDCPayment(invoiceData) {
    console.log("💸 Simulating USDC payment...");

    // In a real implementation, you would:
    // 1. Connect to user's wallet (Phantom, Solflare, etc.)
    // 2. Create and send USDC transfer transaction
    // 3. Get actual transaction signature

    // For demo, create a mock transaction signature
    // const mockTxSig = '65CBfsSZQG2MFvYNyeBjiZz7yFG54MYQaL3ChVdkeaopq2D89pWj85SsexqYEQBPr2NDtQKTwG5LQNfGV8VCThwg';
    const mockTxSig =
      "z1KhNhkrYXJafwVk9BWqqe3eA2n7pQ2ZA3ABjpik4R7vxBhok6rE7cXiMbUT5wUqZVxNa65RgRGPuXJMSEtRVtu"; // mid

    console.log(`📝 Mock transaction signature: ${mockTxSig}`);
    console.log(
      `💰 Amount: ${invoiceData.payment_instruction.amount_usdc} USDC`
    );
    console.log(`📍 Recipient: ${invoiceData.payment_instruction.send_to}`);
    console.log(`🔗 Reference: ${invoiceData.reference}`);

    return mockTxSig;
  }

  /**
   * Step 3: Submit payment and get signal
   */
  async submitPaymentAndGetSignal(
    reference,
    txSig,
    riskLevel,
    network = "devnet"
  ) {
    try {
      console.log(`📤 Submitting payment with reference: ${reference}`);

      const response = await this.client.get("/signal", {
        params: {
          risk: riskLevel,
          network: network,
          reference: reference,
          tx_sig: txSig,
        },
      });

      console.log("🎯 Signal received:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error submitting payment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Complete lifecycle: Request -> Pay -> Get Signal
   */
  async getSignalWithPayment(riskLevel = "low", network = "devnet") {
    try {
      console.log("🚀 Starting signal request lifecycle...");
      console.log("=====================================");

      // New flow: listen to SSE for a newly mined signal, then purchase by UUID
      const mined = await this.subscribeToSignalStream(riskLevel, true);
      const signalUUID = mined.uuid;

      // Request invoice for that UUID
      const invoiceData = await this.requestSignalByUUID(signalUUID, network);
      if (!invoiceData.reference) {
        console.log("✅ Full signal available without payment");
        return invoiceData;
      }

      // Simulate payment
      const txSig = await this.simulateUSDCPayment(invoiceData);

      // Submit payment and retrieve full signal body
      const signal = await this.submitPaymentForUUID(
        signalUUID,
        invoiceData.reference,
        txSig,
        network
      );

      console.log("🎉 Complete lifecycle finished successfully!");
      console.log("=====================================");
      return signal;
    } catch (error) {
      console.error("💥 Lifecycle failed:", error.message);
      throw error;
    }
  }

  /**
   * Check invoice status
   */
  async checkInvoiceStatus(reference) {
    try {
      const response = await this.client.get(
        `/x402/solana/status/${reference}`
      );
      console.log(`📊 Invoice status for ${reference}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error checking invoice status:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(reference) {
    try {
      const response = await this.client.get(
        `/x402/solana/invoice/${reference}`
      );
      console.log(`📋 Invoice details for ${reference}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error getting invoice:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

/**
 * Demo function to showcase the complete API flow
 */
async function demonstrateSignalAPI() {
  const client = new SignalAPIClient();

  try {
    const risk = "mid";
    console.log(`\n🎲 Testing ${risk} risk level with SSE + per-UUID flow...`);
    console.log("------------------------");

    // Prompt for seed phrase if running live payment demo via env flag
    if (process.env.LIVE_PAYMENT === "1") {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const ask = (q) =>
        new Promise((res) => rl.question(q, (ans) => res(ans)));
      const mnemonic =
        process.env.SEED_PHRASE ||
        (await ask("Enter BIP39 seed phrase (mnemonic): "));
      rl.close();
      const signal = await client.getSignalWithSeed(risk, "devnet", mnemonic);
      console.log(`📈 Result for ${risk} risk (live):`, signal);
    } else {
      const signal = await client.getSignalWithPayment(risk, "devnet");
      console.log(`📈 Result for ${risk} risk (simulated):`, signal);
    }

    // Test error handling
    console.log("\n🧪 Testing error handling...");
    console.log("---------------------------");

    try {
      await client.requestSignal("invalid", "devnet");
    } catch (error) {
      console.log("✅ Caught expected error for invalid risk level");
    }

    try {
      await client.checkInvoiceStatus("invalid-reference");
    } catch (error) {
      console.log("✅ Caught expected error for invalid reference");
    }
  } catch (error) {
    console.error("💥 Demo failed:", error?.message || error);
    if (error?.stack) console.error(error.stack);
  }
}

/**
 * Example of real wallet integration (pseudo-code)
 */
class RealWalletIntegration {
  constructor() {
    this.client = new SignalAPIClient();
  }

  async getSignalWithRealWallet(riskLevel = "low", network = "devnet") {
    try {
      console.log("🔗 Connecting to wallet...");

      // In real implementation:
      // const wallet = window.solana || window.phantom?.solana;
      // if (!wallet) throw new Error('Wallet not found');
      // await wallet.connect();

      console.log("💳 Requesting invoice...");
      const invoice = await this.client.requestSignal(riskLevel, network);

      console.log("🏗️  Building transaction...");
      // Build actual USDC transfer transaction here
      // const transaction = await buildUSDCTransaction(invoice.payment_instruction);

      console.log("✍️  Signing and sending transaction...");
      // const txSig = await wallet.signAndSendTransaction(transaction);

      // For demo, use mock signature
      const txSig = await this.client.simulateUSDCPayment(invoice);

      console.log("📤 Submitting payment and getting signal...");
      const signal = await this.client.submitPaymentAndGetSignal(
        invoice.reference,
        txSig,
        riskLevel,
        network
      );

      return signal;
    } catch (error) {
      console.error("❌ Real wallet integration failed:", error.message);
      throw error;
    }
  }
}

// Export for use in other modules
module.exports = {
  SignalAPIClient,
  RealWalletIntegration,
  demonstrateSignalAPI,
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateSignalAPI().catch(console.error);
}
