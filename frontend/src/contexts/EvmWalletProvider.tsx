import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type Address, createPublicClient, createWalletClient, custom, http } from 'viem';
import { defineChain } from 'viem/utils';

type EvmWalletContextValue = {
  connected: boolean;
  address: Address | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  publicClient: ReturnType<typeof createPublicClient> | undefined;
  walletClient: ReturnType<typeof createWalletClient> | undefined;
};

const EvmWalletContext = createContext<EvmWalletContextValue | undefined>(undefined);

// Basic hardhat-style local chain; fallback only.
const hardhat = defineChain({
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
});

async function fetchBackendRpcUrl(): Promise<string | undefined> {
  try {
    const res = await fetch('/api/v1/blockchain/config');
    if (!res.ok) return undefined;
    const data = await res.json();
    return data?.blockchain_rpc_url as string | undefined;
  } catch {
    return undefined;
  }
}

export function EvmWalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [rpcUrl, setRpcUrl] = useState<string>('http://127.0.0.1:8545');

  const publicClientRef = useRef<ReturnType<typeof createPublicClient> | undefined>(undefined);
  const walletClientRef = useRef<ReturnType<typeof createWalletClient> | undefined>(undefined);

  useEffect(() => {
    // Fetch RPC URL from backend config on mount (best-effort)
    fetchBackendRpcUrl().then((url) => {
      if (url) setRpcUrl(url);
    });
  }, []);

  const publicClient = useMemo(() => {
    const client = createPublicClient({ chain: hardhat, transport: http(rpcUrl) });
    publicClientRef.current = client;
    return client;
  }, [rpcUrl]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No EVM wallet detected');
    }
    const wc = createWalletClient({ chain: hardhat, transport: custom((window as any).ethereum) });
    walletClientRef.current = wc;
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    const addr = (accounts?.[0] || '') as string;
    setAddress(addr as Address);
    setConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(undefined);
    walletClientRef.current = undefined;
  }, []);

  const value: EvmWalletContextValue = {
    connected,
    address,
    connect,
    disconnect,
    publicClient,
    walletClient: walletClientRef.current,
  };

  return <EvmWalletContext.Provider value={value}>{children}</EvmWalletContext.Provider>;
}

export function useEvmWallet(): EvmWalletContextValue {
  const ctx = useContext(EvmWalletContext);
  if (!ctx) throw new Error('useEvmWallet must be used within EvmWalletProvider');
  return ctx;
}


