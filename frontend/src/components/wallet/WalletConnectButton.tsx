import { useState, useEffect } from 'react';
import { Button } from '@components';
import { useWallet } from '@suiet/wallet-kit';

interface WalletConnectButtonProps {
    onWalletConnected?: (address: string) => void;
    className?: string;
}

export const WalletConnectButton = ({
    onWalletConnected,
    className,
}: WalletConnectButtonProps) => {
    const wallet = useWallet();
    const { connected, select, address, connecting, configuredWallets } =
        wallet;
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async (walletName: string) => {
        try {
            setError(null);
            await select(walletName);
        } catch (e) {
            console.error('Failed to connect wallet:', e);
            setError(
                'Failed to connect wallet. Please make sure your wallet is installed and unlocked.'
            );
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
                {error && (
                    <p className="text-sm text-red-600 text-center mt-2">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                {configuredWallets.map((wallet) => (
                    <button
                        key={wallet.name}
                        onClick={() => handleConnect(wallet.name)}
                        disabled={connecting}
                        className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg p-4 h-24 md:h-28 w-full hover:bg-gray-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <div className="flex-shrink-0 mb-2">
                            {wallet.iconUrl ? (
                                <img
                                    src={wallet.iconUrl}
                                    alt=""
                                    className="w-10 h-10 md:w-12 md:h-12"
                                />
                            ) : (
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-500 font-semibold text-lg">
                                        {wallet.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className="text-sm md:text-base font-medium text-gray-800 text-center">
                            {connecting ? 'Connecting...' : wallet.name}
                        </span>
                    </button>
                ))}
            </div>
            {error && (
                <p className="text-sm text-red-600 text-center mt-4">{error}</p>
            )}
        </div>
    );
};
