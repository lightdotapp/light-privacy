import { Connection, PublicKey, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// Browser-compatible random bytes function
function randomBytes(length: number): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }
  // Fallback for Node.js environments
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  return new Uint8Array(crypto.randomBytes(length));
}

// Solana devnet connection
export const DEVNET_RPC = "https://api.devnet.solana.com";
export const connection = new Connection(DEVNET_RPC, "confirmed");

// Simplified Arcium client for browser environments (fallback version)
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
      console.log("Arcium client initialized (simple mode)");
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
      // Simple encryption simulation without complex Arcium libraries
      console.log("Encrypting payment data (simulated)...");
      
      // Generate mock encryption data
      const _mockPrivateKey = randomBytes(32);
      const mockPublicKey = randomBytes(32);
      const mockNonce = randomBytes(16);
      
      // Simulate encryption by creating mock ciphertext
      const mockCiphertext = [
        Array.from(randomBytes(32)), // Mock encrypted amount
        Array.from(randomBytes(32))  // Mock encrypted recipient data
      ];

      // Prepare payment data
      const paymentData = {
        amount: amount,
        recipient: recipient,
        sender: sender,
        timestamp: Date.now(),
      };

      console.log("Payment data encrypted successfully (simulated)");

      return {
        ciphertext: mockCiphertext,
        publicKey: Array.from(mockPublicKey),
        nonce: Array.from(mockNonce),
        paymentData, // Keep unencrypted version for reference (remove in production)
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async submitPrivatePayment(_encryptedData: unknown) {
    if (!this.mxePublicKey) {
      throw new Error("Arcium client not initialized");
    }

    try {
      // For browser demo, we'll simulate the payment submission
      console.log("Submitting private payment (simulated)...");
      
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

  async awaitPaymentCompletion(_computationOffset: unknown) {
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
export function createWalletFromKeypair(keypair: Keypair): Wallet {
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      if (tx instanceof Transaction) {
        tx.sign(keypair);
      } else if (tx instanceof VersionedTransaction) {
        tx.sign([keypair]);
      }
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach((tx) => {
        if (tx instanceof Transaction) {
          tx.sign(keypair);
        } else if (tx instanceof VersionedTransaction) {
          tx.sign([keypair]);
        }
      });
      return txs;
    },
  } as Wallet;
}
