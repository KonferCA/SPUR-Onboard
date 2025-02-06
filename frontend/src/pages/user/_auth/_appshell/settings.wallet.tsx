import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components'
import { SettingsPage } from '@/templates/SettingsPage/SettingsPage'
import { FiCopy } from 'react-icons/fi'
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton'
import { useWallet } from '@suiet/wallet-kit'
import { useAuth } from '@/contexts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCompany, updateCompany } from '@/services'

export const Route = createFileRoute('/user/_auth/_appshell/settings/wallet')({
  component: WalletSettings,
})

function WalletSettings() {
  const [error, setError] = useState<string | null>(null)
  const { connected, address, disconnect } = useWallet()
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => {
      if (!accessToken) throw new Error('No access token')
      return getCompany(accessToken)
    },
    enabled: !!accessToken,
  })

  // Update company mutation
  const { mutate: updateWallet, isLoading: isUpdating } = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('No access token')
      if (!address) throw new Error('No wallet address')
      return updateCompany(accessToken, {
        wallet_address: address || ''
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      setError(null)
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update wallet address')
      }
    },
  })

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnect()
      // Clear wallet address from company when disconnecting
      if (accessToken) {
        await updateCompany(accessToken, { wallet_address: '' })
        queryClient.invalidateQueries({ queryKey: ['company'] })
      }
    } catch (err) {
      setError('Failed to disconnect wallet')
    }
  }

  const handleSaveWallet = async () => {
    if (connected && address) {
      updateWallet()
    }
  }

  const isWalletSaved = company?.wallet_address === address

  return (
    <SettingsPage title="Wallet" error={error}>
      <div className="max-w-2xl">
        {!connected ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Connect your wallet</h3>
            <p className="text-gray-600 mb-6">
              Connect your Sui wallet to manage your account and participate in
              projects.
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <img src="/sui-logo.svg" alt="Sui" className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium mb-1">Sui wallet connected</h3>
                  <div className="flex items-center gap-2 break-all">
                    <p className="text-gray-500 text-sm font-mono">{address}</p>
                    <button
                      onClick={handleCopyAddress}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {!isWalletSaved && (
                  <Button
                    onClick={handleSaveWallet}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? 'Saving...' : 'Save Wallet Address'}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleDisconnectWallet}
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsPage>
  )
}
