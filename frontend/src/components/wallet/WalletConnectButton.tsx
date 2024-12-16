import { useState, useEffect } from 'react';
import { Button } from '@components';
import { useWallet } from '@suiet/wallet-kit';

interface WalletConnectButtonProps {
    onWalletConnected?: (address: string) => void;
    className?: string;
}

export const WalletConnectButton = ({ onWalletConnected, className }: WalletConnectButtonProps) => {
    const { connected, select, address, connecting } = useWallet();
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        try {
            setError(null);
            await select('Suiet');
        } catch (e) {
            console.error('Failed to connect wallet:', e);
            setError('Please make sure Suiet wallet is installed and unlocked');
            window.open('https://chrome.google.com/webstore/detail/suiet-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd', '_blank');
        }
    };

    useEffect(() => {
        if (connected && address) {
            console.log('Connected wallet address:', address);
            onWalletConnected?.(address);
            setError(null);
        }
    }, [connected, address, onWalletConnected]);

    if (connected) return null;

    return (
        <div className={`space-y-2 ${className}`}>
            <Button
                type="button"
                size="lg"
                liquid
                variant="primary"
                onClick={handleConnect}
                disabled={connecting}
            >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
            )}
        </div>
    );
}; 