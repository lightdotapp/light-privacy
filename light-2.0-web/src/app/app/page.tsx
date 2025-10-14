'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import '@solana/wallet-adapter-react-ui/styles.css';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

export default function AppPage() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new BackpackWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SendSolView />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function SendSolView() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);
  const [toAddress, setToAddress] = useState<string>('');
  const [amountSol, setAmountSol] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Fetch balance when publicKey changes
  useEffect(() => {
    if (!publicKey) {
      setBalanceLamports(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) setBalanceLamports(lamports);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  const setUseMax = useCallback(() => {
    if (balanceLamports === null) return;
    const buffer = 5000; // small buffer for fees
    const maxLamports = Math.max(0, balanceLamports - buffer);
    setAmountSol((maxLamports / LAMPORTS_PER_SOL).toString());
  }, [balanceLamports]);

  const sendSol = useCallback(async () => {
    if (!connected || !publicKey) {
      setStatus('Connect your wallet first.');
      return;
    }
    let recipient: PublicKey;
    try {
      recipient = new PublicKey(toAddress);
    } catch {
      setStatus('Enter a valid Solana address.');
      return;
    }
    const amount = Number(amountSol);
    if (!Number.isFinite(amount) || amount <= 0) {
      setStatus('Enter a valid SOL amount.');
      return;
    }
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    const transaction = new Transaction().add(
      SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: recipient, lamports })
    );
    transaction.feePayer = publicKey;
    try {
      setIsSending(true);
      setStatus('Preparing transaction...');
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      const signature = await sendTransaction(transaction, connection, { skipPreflight: false });
      setStatus(`Sent. Signature: ${signature}`);
      setTimeout(async () => {
        try {
          const lamportsAfter = await connection.getBalance(publicKey);
          setBalanceLamports(lamportsAfter);
        } catch {}
      }, 3000);
    } catch (err: unknown) {
      console.error(err);
      setStatus('Transaction failed. See console for details.');
    } finally {
      setIsSending(false);
    }
  }, [connected, publicKey, toAddress, amountSol, connection, sendTransaction]);

  const shortKey = useMemo(() => {
    if (!publicKey) return '';
    const s = publicKey.toBase58();
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  }, [publicKey]);

  const balanceSol = useMemo(() => {
    return balanceLamports === null ? null : balanceLamports / LAMPORTS_PER_SOL;
  }, [balanceLamports]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Light Logo" width={36} height={36} />
          <span className="font-semibold text-lg">Light</span>
        </div>
        <div className="flex items-center gap-3">
          {publicKey && (
            <div className="text-sm text-muted-foreground hidden sm:block">
              {shortKey} {balanceSol !== null ? `• ${balanceSol.toFixed(4)} SOL` : ''}
            </div>
          )}
          <WalletMultiButton className="!bg-black !text-white" />
        </div>
      </header>

      {/* Main */}
      <main className="px-4 md:px-8 py-8 flex justify-center">
        <Card className="w-full max-w-2xl p-6 border border-border shadow-xl">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Sending privately</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Light 2.0 works on Solana Devnet{' '}<a className="underline" href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">Faucet here</a>.
          </p>

          <div className="space-y-6">
            {/* Token + amount panel */}
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00D18C] p-[1px]">
                  <div className="flex items-center gap-2 bg-background rounded-full px-3 py-1.5">
                    <span className="inline-flex items-center justify-center size-6 rounded-full bg-black">
                      <Image src="/sol.svg" alt="SOL" width={14} height={14} />
                    </span>
                    <span className="font-semibold">SOL</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {balanceSol !== null && (
                    <span className="text-xs text-muted-foreground">Balance: {balanceSol.toFixed(6)} SOL</span>
                  )}
                  <Button type="button" size="sm" variant="secondary" onClick={setUseMax} disabled={balanceSol === null}>
                    MAX
                  </Button>
                </div>
              </div>
              <div className="pt-2">
                <input
                  placeholder="0"
                  inputMode="decimal"
                  value={amountSol}
                  onChange={(e) => setAmountSol(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-right text-6xl font-semibold tracking-tight placeholder:text-muted-foreground focus:ring-0"
                />
              </div>
            </div>

            {/* Recipient row */}
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <div className="text-sm text-muted-foreground mb-2">To</div>
              <Input
                placeholder="Enter recipient address (e.g. heymike.sol or 111...111)"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button onClick={sendSol} disabled={!connected || isSending} className="w-full h-12 text-base">
                {connected ? (isSending ? 'Sending...' : 'Send SOL') : 'Connect Wallet'}
              </Button>
            </div>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </Card>
      </main>
    </div>
  );
}

