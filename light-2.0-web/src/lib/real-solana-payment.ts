import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// Solana devnet connection
export const DEVNET_RPC = "https://api.devnet.solana.com";
export const connection = new Connection(DEVNET_RPC, "confirmed");

// Real Solana payment implementation
export class RealSolanaPaymentClient {
  private provider: AnchorProvider;
  private connection: Connection;

  constructor(wallet: Wallet) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }

  async initialize() {
    try {
      console.log("Real Solana payment client initialized");
    } catch (error) {
      console.error("Failed to initialize Solana payment client:", error);
      throw error;
    }
  }

  async createPaymentTransaction(amount: number, recipient: string, sender: PublicKey) {
    try {
      console.log("Creating real Solana payment transaction...");
      
      // Convert SOL to lamports
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // Create recipient public key
      const recipientPubkey = new PublicKey(recipient);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipientPubkey,
        lamports: lamports,
      });
      
      transaction.add(transferInstruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;
      
      console.log("Transaction created:", {
        amount: amount,
        lamports: lamports,
        recipient: recipient,
        sender: sender.toString(),
        blockhash: blockhash
      });
      
      return transaction;
    } catch (error) {
      console.error("Failed to create payment transaction:", error);
      throw error;
    }
  }

  async signAndSendTransaction(transaction: Transaction) {
    try {
      console.log("Signing and sending real transaction...");
      
      // Sign the transaction
      const signedTransaction = await this.provider.wallet.signTransaction(transaction);
      
      // Send the transaction
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      console.log("Transaction sent with signature:", signature);
      
      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, "confirmed");
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      
      console.log("Transaction confirmed:", confirmation);
      
      return {
        signature,
        confirmation,
        transaction: signedTransaction
      };
    } catch (error) {
      console.error("Failed to sign and send transaction:", error);
      throw error;
    }
  }

  async getTransactionDetails(signature: string) {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: "confirmed"
      });
      
      if (!transaction) {
        throw new Error("Transaction not found");
      }
      
      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee,
        status: transaction.meta?.err ? "failed" : "success",
        logs: transaction.meta?.logMessages || []
      };
    } catch (error) {
      console.error("Failed to get transaction details:", error);
      throw error;
    }
  }

  async simulatePayment(amount: number, recipient: string, sender: PublicKey) {
    try {
      console.log("Simulating payment with real transaction...");
      
      // Create transaction
      const transaction = await this.createPaymentTransaction(amount, recipient, sender);
      
      // Simulate the transaction (don't actually send it)
      const simulation = await this.connection.simulateTransaction(transaction);
      
      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${simulation.value.err}`);
      }
      
      console.log("Transaction simulation successful:", simulation);
      
      return {
        success: true,
        simulation,
        transaction
      };
    } catch (error) {
      console.error("Payment simulation failed:", error);
      throw error;
    }
  }
}

// Utility function to create a wallet from keypair
export function createWalletFromKeypair(keypair: { publicKey: PublicKey; sign: (tx: Transaction) => void }): Wallet {
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      if (tx instanceof Transaction) {
        keypair.sign(tx);
      }
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach((tx) => {
        if (tx instanceof Transaction) {
          keypair.sign(tx);
        }
      });
      return txs;
    },
  } as Wallet;
}
