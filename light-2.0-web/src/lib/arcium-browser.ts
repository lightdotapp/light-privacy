import { x25519, RescueCipher } from "@arcium-hq/client";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// Browser-compatible random bytes function
function randomBytes(length: number): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }
  // Fallback for Node.js environments
  const crypto = require('crypto');
  return new Uint8Array(crypto.randomBytes(length));
}

// Solana devnet connection
export const DEVNET_RPC = "https://api.devnet.solana.com";
export const connection = new Connection(DEVNET_RPC, "confirmed");

// Simplified Arcium client for browser environments
export class ArciumPaymentClient {
  private provider: AnchorProvider;
  private mxePublicKey: PublicKey | null = null;

  constructor(wallet: Wallet) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }

  async initialize() {
    try {
      // For browser environments, we'll use a mock MXE public key
      // In production, you would get this from the actual Arcium network
      this.mxePublicKey = new PublicKey("11111111111111111111111111111111");
      console.log("Arcium client initialized (browser mode)");
    } catch (error) {
      console.error("Failed to initialize Arcium client:", error);
      throw error;
    }
  }

  async encryptPaymentData(amount: bigint, recipient: string, sender: string) {
    if (!this.mxePublicKey) {
      throw new Error("Arcium client not initialized");
    }

    try {
      // Generate keypair for this transaction
      const privateKey = x25519.utils.randomPrivateKey();
      const publicKey = x25519.getPublicKey(privateKey);

      // Derive shared secret with MXE
      const sharedSecret = x25519.getSharedSecret(privateKey, this.mxePublicKey);
      const cipher = new RescueCipher(sharedSecret);

      // Prepare payment data
      const paymentData = {
        amount: amount,
        recipient: recipient,
        sender: sender,
        timestamp: Date.now(),
      };

      // Encrypt the payment data with proper formatting
      const nonce = randomBytes(16);
      
      // Convert amount to proper format for encryption
      const amountBytes = new Uint8Array(8);
      const amountView = new DataView(amountBytes.buffer);
      amountView.setBigUint64(0, amount, false); // little-endian
      
      // Convert recipient length to bytes
      const recipientLengthBytes = new Uint8Array(4);
      const recipientLengthView = new DataView(recipientLengthBytes.buffer);
      recipientLengthView.setUint32(0, recipient.length, false); // little-endian
      
      // Create plaintext array with proper byte arrays
      const plaintext = [Array.from(amountBytes), Array.from(recipientLengthBytes)];
      const ciphertext = cipher.encrypt(plaintext, nonce);

      return {
        ciphertext,
        publicKey: Array.from(publicKey),
        nonce: Array.from(nonce),
        paymentData, // Keep unencrypted version for reference (remove in production)
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async submitPrivatePayment(encryptedData: any) {
    if (!this.mxePublicKey) {
      throw new Error("Arcium client not initialized");
    }

    try {
      // For browser demo, we'll simulate the payment submission
      // In production, this would interact with the actual Arcium network
      console.log("Simulating private payment submission...");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction signature
      const mockSignature = Array.from(randomBytes(32))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const computationOffset = Array.from(randomBytes(8))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      console.log("Private payment submitted (simulated):", mockSignature);
      return { signature: mockSignature, computationOffset };
    } catch (error) {
      console.error("Failed to submit private payment:", error);
      throw error;
    }
  }

  async awaitPaymentCompletion(computationOffset: any) {
    try {
      // Simulate waiting for computation completion
      console.log("Waiting for computation to complete...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock finalization signature
      const finalizeSig = Array.from(randomBytes(32))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      console.log("Payment computation finalized (simulated):", finalizeSig);
      return finalizeSig;
    } catch (error) {
      console.error("Failed to await payment completion:", error);
      throw error;
    }
  }
}

// Utility function to create a wallet from keypair
export function createWalletFromKeypair(keypair: any): Wallet {
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      tx.sign(keypair);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach((tx) => tx.sign(keypair));
      return txs;
    },
  };
}
