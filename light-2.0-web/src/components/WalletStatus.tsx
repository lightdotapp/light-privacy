"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function WalletStatus() {
  const { connected, publicKey, wallet } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-600">Loading wallet status...</p>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          ⚠️ No wallet connected. Please connect a wallet to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
      <p className="text-sm text-green-800 font-medium">
        ✅ Wallet Connected
      </p>
      <p className="text-xs text-green-600 mt-1">
        {wallet?.adapter.name}: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
      </p>
    </div>
  );
}
