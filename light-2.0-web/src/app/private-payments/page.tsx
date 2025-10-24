"use client";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import PrivatePaymentForm from "@/components/PrivatePaymentForm";
import SimpleWalletButton from "@/components/SimpleWalletButton";

// Note: Wallet adapter styles are handled by the global CSS

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

export default function PrivatePaymentsPage() {
  return (
    <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
      <WalletProvider wallets={wallets} autoConnect={false}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Private Payments with Arcium
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Send encrypted payments using Arcium&apos;s confidential computation network. 
                  Your payment data is encrypted and processed through secure multi-party computation.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This is a browser-compatible demo version. In production, 
                    you would connect to actual Arcium MXE nodes for real confidential computation.
                  </p>
                </div>
                
                {/* Wallet Connection Button */}
                <div className="mt-6 flex justify-center">
                  <SimpleWalletButton />
                </div>
              </div>
              
              <div className="flex justify-center">
                <PrivatePaymentForm />
              </div>

              <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <h3 className="font-semibold mb-2">Encrypt Data</h3>
                      <p className="text-gray-600 text-sm">
                        Your payment data is encrypted using shared secrets with Arcium&apos;s MXE network
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <h3 className="font-semibold mb-2">Submit Computation</h3>
                      <p className="text-gray-600 text-sm">
                        Encrypted data is submitted to Arcium&apos;s confidential computation network
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      <h3 className="font-semibold mb-2">Secure Processing</h3>
                      <p className="text-gray-600 text-sm">
                        Multi-party computation processes your payment securely without revealing data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WalletProvider>
      </ConnectionProvider>
  );
}
