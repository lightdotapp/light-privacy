"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RealSolanaPaymentClient } from "@/lib/real-solana-payment";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "@coral-xyz/anchor";

interface PaymentData {
  amount: string;
  recipient: string;
  memo?: string;
}

export default function PrivatePaymentForm() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: "",
    recipient: "",
    memo: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !signTransaction || !signAllTransactions) {
      setPaymentStatus("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("Initializing private payment...");

    try {
      // Create wallet adapter for Arcium client
      const wallet: Wallet = {
        publicKey,
        signTransaction,
        signAllTransactions,
      } as Wallet;

      // Initialize real Solana payment client
      const solanaClient = new RealSolanaPaymentClient(wallet);
      await solanaClient.initialize();
      
      setPaymentStatus("Creating Solana transaction...");

      // Create real Solana transaction
      const amount = parseFloat(paymentData.amount);
      const transaction = await solanaClient.createPaymentTransaction(
        amount,
        paymentData.recipient,
        publicKey
      );

      setPaymentStatus("Signing transaction with your wallet...");

      // Sign and send the transaction
      const result = await solanaClient.signAndSendTransaction(transaction);
      setTransactionSignature(result.signature);
      
      setPaymentStatus("Transaction confirmed on Solana network!");

      setPaymentStatus(`✅ Payment completed! Transaction: ${result.signature}`);
      
    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more helpful error messages
      if (errorMessage.includes('User rejected')) {
        setPaymentStatus('❌ Transaction cancelled: You rejected the transaction in your wallet.');
      } else if (errorMessage.includes('Insufficient funds')) {
        setPaymentStatus('❌ Insufficient funds: Not enough SOL in your wallet.');
      } else if (errorMessage.includes('Invalid recipient')) {
        setPaymentStatus('❌ Invalid recipient: Please check the recipient address.');
      } else if (errorMessage.includes('Transaction failed')) {
        setPaymentStatus('❌ Transaction failed: The transaction was rejected by the network.');
      } else if (errorMessage.includes('not initialized')) {
        setPaymentStatus('❌ Client error: Solana client not properly initialized.');
      } else {
        setPaymentStatus(`❌ Payment failed: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Private Payment</CardTitle>
          <CardDescription>
            Send encrypted payments using Arcium&apos;s confidential computation network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Private Payment</CardTitle>
        <CardDescription>
          Send encrypted payments using Arcium&apos;s confidential computation network
        </CardDescription>
        {publicKey && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✅ Wallet connected: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount (SOL)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.000000001"
              min="0"
              value={paymentData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.1"
              required
            />
          </div>

          <div>
            <label htmlFor="recipient" className="block text-sm font-medium mb-1">
              Recipient Address
            </label>
            <Input
              id="recipient"
              type="text"
              value={paymentData.recipient}
              onChange={(e) => handleInputChange("recipient", e.target.value)}
              placeholder="Enter Solana address"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium mb-1">
              Memo (Optional)
            </label>
            <Input
              id="memo"
              type="text"
              value={paymentData.memo || ""}
              onChange={(e) => handleInputChange("memo", e.target.value)}
              placeholder="Payment memo"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !publicKey}
          >
            {!publicKey ? "Connect Wallet First" : isProcessing ? "Processing..." : "Send Private Payment"}
          </Button>

          {paymentStatus && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm">{paymentStatus}</p>
            </div>
          )}

          {transactionSignature && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium">Transaction Signature:</p>
              <p className="text-xs text-gray-600 break-all mb-2">{transactionSignature}</p>
              <a 
                href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View on Solana Explorer →
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
