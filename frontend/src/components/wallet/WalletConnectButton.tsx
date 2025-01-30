import { useState, useEffect } from 'react';
import { Button } from '@components';
import { useWallet } from '@suiet/wallet-kit';

interface WalletConnectButtonProps {
    onWalletConnected?: (address: string) => void;
    className?: string;
}

export const WalletConnectButton = ({ onWalletConnected, className }: WalletConnectButtonProps) => {
    const wallet = useWallet();
    const { connected, select, address, connecting, configuredWallets } = wallet;
    const [error, setError] = useState<string | null>(null);

    console.log('Wallet state:', {
        connected,
        connecting,
        configuredWallets,
        allWalletState: wallet
    });

    const handleConnect = async (walletName: string) => {
        try {
            setError(null);
            await select(walletName);
        } catch (e) {
            console.error('Failed to connect wallet:', e);
            setError('Failed to connect wallet. Please make sure your wallet is installed and unlocked.');
        }
    };

    useEffect(() => {
        if (connected && address) {
            console.log('Connected wallet address:', address);
            onWalletConnected?.(address);
            setError(null);
        }
    }, [connected, address, onWalletConnected]);

    // If no wallets are configured, show a single connect button
    if (!configuredWallets?.length) {
        return (
            <div className={`space-y-4 ${className}`}>
                <Button
                    type="button"
                    size="lg"
                    liquid
                    variant="primary"
                    onClick={() => handleConnect('Suiet')}
                    disabled={connecting}
                >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
                {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="grid gap-2">
                {configuredWallets.map((wallet) => (
                    <Button
                        key={wallet.name}
                        type="button"
                        size="lg"
                        liquid
                        variant="secondary"
                        onClick={() => handleConnect(wallet.name)}
                        disabled={connecting}
                        className="flex items-center justify-center gap-2"
                    >
                        {wallet.iconUrl && (
                            <img src={wallet.iconUrl} alt={wallet.name} className="w-5 h-5" />
                        )}
                        {connecting ? 'Connecting...' : `Connect ${wallet.name}`}
                    </Button>
                ))}
            </div>
            {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
            )}
        </div>
    );
}; 