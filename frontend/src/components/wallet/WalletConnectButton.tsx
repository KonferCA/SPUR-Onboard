import { useState, useEffect } from 'react';
import { Button } from '@components';
import { useEvmWallet } from '@/contexts/EvmWalletProvider';

interface WalletConnectButtonProps {
    onWalletConnected?: (address: string) => void;
    className?: string;
}

export const WalletConnectButton = ({
    onWalletConnected,
    className,
}: WalletConnectButtonProps) => {
    const { connected, connect, disconnect, address } = useEvmWallet();
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);
    const handleConnect = async () => {
        try {
            setError(null);
            setConnecting(true);
            await connect();
        } catch (e) {
            console.error('Failed to connect wallet:', e);
            setError('Failed to connect wallet. Please ensure your wallet is installed and unlocked.');
        } finally {
            setConnecting(false);
        }
    };

    useEffect(() => {
        if (connected && address) {
            console.log('Connected wallet address:', address);
            onWalletConnected?.(address);
            setError(null);
        }
    }, [connected, address, onWalletConnected]);

    return (
        <div className={`space-y-4 ${className}`}>
            {!connected ? (
                <Button
                    type="button"
                    size="lg"
                    liquid
                    variant="primary"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
            ) : (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">{address}</span>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={disconnect}
                        className="bg-gray-100 hover:bg-gray-200"
                    >
                        Disconnect
                    </Button>
                </div>
            )}
            {error && (
                <p className="text-sm text-red-600 text-center mt-2">{error}</p>
            )}
        </div>
    );
};
