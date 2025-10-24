import { x25519, getMXEPublicKey, RescueCipher, awaitComputationFinalization } from "@arcium-hq/client";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";

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

// Arcium client configuration
export class ArciumPaymentClient {
  private provider: AnchorProvider;
  private program: Program;
  private mxePublicKey: PublicKey | null = null;

  constructor(wallet: Wallet) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    // Note: You'll need to replace this with the actual Arcium program ID
    // This is a placeholder - check Arcium docs for the correct program ID
    this.program = new Program(
      {} as any, // Program IDL
      new PublicKey("11111111111111111111111111111111"), // Placeholder program ID
      this.provider
    );
  }

  async initialize() {
    try {
      this.mxePublicKey = await getMXEPublicKey(this.provider, this.program.programId);
      if (!this.mxePublicKey) {
        throw new Error("MXE public key not available");
      }
      console.log("Arcium client initialized with MXE:", this.mxePublicKey.toString());
    } catch (error) {
      console.error("Failed to initialize Arcium client:", error);
      throw error;
    }
  }

  async encryptPaymentData(amount: bigint, recipient: string, sender: string) {
    if (!this.mxePublicKey) {
      throw new Error("Arcium client not initialized");
    }

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

    // Encrypt the payment data
    const nonce = randomBytes(16);
    const plaintext = [BigInt(amount), BigInt(recipient.length)]; // Simplified for example
    const ciphertext = cipher.encrypt(plaintext, nonce);

    return {
      ciphertext,
      publicKey: Array.from(publicKey),
      nonce: Array.from(nonce),
      paymentData, // Keep unencrypted version for reference (remove in production)
    };
  }

  async submitPrivatePayment(encryptedData: any) {
    if (!this.mxePublicKey) {
      throw new Error("Arcium client not initialized");
    }

    try {
      // Generate computation offset
      const computationOffset = new (await import("@coral-xyz/anchor")).BN(
        randomBytes(8),
        "hex"
      );

      // Submit encrypted computation to Arcium network
      // Note: This is a simplified example - actual implementation would depend on
      // the specific Arcium program methods available
      const signature = await this.program.methods
        .processPrivatePayment(
          computationOffset,
          encryptedData.ciphertext[0],
          encryptedData.ciphertext[1],
          encryptedData.publicKey,
          new (await import("@coral-xyz/anchor")).BN(
            Array.from(encryptedData.nonce).map(b => b.toString(16).padStart(2, '0')).join(''),
            16
          )
        )
        .accountsPartial({
          // Account setup would go here
        })
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log("Private payment submitted:", signature);
      return { signature, computationOffset };
    } catch (error) {
      console.error("Failed to submit private payment:", error);
      throw error;
    }
  }

  async awaitPaymentCompletion(computationOffset: any) {
    try {
      const finalizeSig = await awaitComputationFinalization(
        this.provider,
        computationOffset,
        this.program.programId,
        "confirmed"
      );

      console.log("Payment computation finalized:", finalizeSig);
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
      tx.sign(keypair);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach((tx) => tx.sign(keypair));
      return txs;
    },
  };
}
