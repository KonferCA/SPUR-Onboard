import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button, NotificationBanner } from '@/components';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { useWallet } from '@suiet/wallet-kit';
import { useAuth } from '@/contexts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany } from '@/services';
import { usePageTitle } from '@/utils';

export const Route = createFileRoute('/user/_auth/_appshell/settings/wallet')({
    component: WalletSettings,
});

function WalletSettings() {
    // set wallet page title
    usePageTitle('Wallet');

    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const { connected, address, disconnect } = useWallet();
    const { getAccessToken } = useAuth();
    const queryClient = useQueryClient();

    // fetch company data
    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('No access token');
            }

            return getCompany(accessToken);
        },
        enabled: !!getAccessToken(),
    });

    // update company mutation
    const { mutate: updateWallet, isLoading: isUpdating } = useMutation({
        mutationFn: async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                throw new Error('No access token');
            }

            if (!address) {
                throw new Error('No wallet address');
            }

            return updateCompany(accessToken, {
                wallet_address: address || '',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company'] });
            setError(null);
        },
        onError: (err) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to update wallet address');
            }
        },
    });

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);

            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleDisconnectWallet = async () => {
        try {
            await disconnect();

            const accessToken = getAccessToken();
            // clear wallet address from company when disconnecting
            if (accessToken) {
                await updateCompany(accessToken, { wallet_address: '' });
                queryClient.invalidateQueries({ queryKey: ['company'] });
            }
        } catch (err) {
            setError('Failed to disconnect wallet');
        }
    };

    const handleSaveWallet = async () => {
        if (connected && address) {
            updateWallet();
        }
    };

    const isWalletSaved = company?.wallet_address === address;

    return (
        <>
            <h1 className="text-4xl font-bold mb-6">
                <span className="text-[#F4802F]">Wallet</span> Settings
            </h1>

            {error && (
                <div className="mb-6">
                    <NotificationBanner message={error} variant="error" />
                </div>
            )}

            <hr className="mb-10" />

            <div className="max-w-full mx-auto">
                {!connected ? (
                    <div className="pb-6">
                        <div className="pb-6 mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Connect your wallet
                            </h2>

                            <p className="text-gray-600">
                                Connect your Sui wallet to manage your account
                                and participate in projects.
                            </p>
                        </div>

                        <div className="pt-6">
                            <WalletConnectButton
                                onWalletConnected={(walletAddress) =>
                                    console.log(
                                        'Wallet connected:',
                                        walletAddress
                                    )
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="pb-6 mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Connected wallet
                            </h2>

                            <p className="text-gray-600">
                                Your wallet is connected and ready to use with
                                your account.
                            </p>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-lg mb-6 overflow-hidden hover:border-[#F4802F] hover:shadow-[0_0_0_1px_#F4802F] transition-all duration-300">
                            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <img
                                        src="/sui-logo.svg"
                                        alt="Sui"
                                        className="w-9 h-9"
                                    />
                                </div>

                                <div className="min-w-0 flex-1 w-full text-center sm:text-left">
                                    <h3 className="text-xl font-semibold mb-3">
                                        Sui wallet
                                    </h3>

                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 flex items-center">
                                        <p className="text-gray-700 text-sm font-mono truncate mr-2">
                                            {address}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleCopyAddress}
                                            className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 ml-auto flex-shrink-0"
                                            aria-label="Copy address"
                                            title="Copy address"
                                        >
                                            {copySuccess ? (
                                                <FiCheck className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <FiCopy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {copySuccess && (
                                        <p className="text-green-600 text-xs mb-4">
                                            Address copied to clipboard!
                                        </p>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                                        {!isWalletSaved ? (
                                            <Button
                                                onClick={handleSaveWallet}
                                                disabled={isUpdating}
                                                className="w-full py-2.5 text-base bg-[#F4802F] hover:bg-[#E67321] border border-[#F4802F] text-white rounded-lg transition-all duration-300"
                                            >
                                                {isUpdating
                                                    ? 'Saving...'
                                                    : 'Save Wallet Address'}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center justify-center sm:justify-start text-green-600 bg-green-50 px-4 py-2.5 rounded-lg w-full sm:w-auto">
                                                <FiCheck className="w-5 h-5 mr-2" />
                                                <span className="font-medium">
                                                    Wallet address saved
                                                </span>
                                            </div>
                                        )}

                                        <Button
                                            variant="secondary"
                                            onClick={handleDisconnectWallet}
                                            className="w-full py-2.5 text-base border-gray-300 hover:bg-gray-50"
                                        >
                                            Disconnect Wallet
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
