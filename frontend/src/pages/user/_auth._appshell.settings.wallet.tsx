import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components'
import { SettingsPage } from '@/templates/SettingsPage/SettingsPage'
import { FiCopy } from 'react-icons/fi'
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton'
import { useWallet } from '@suiet/wallet-kit'

export const Route = createFileRoute('/user/_auth/_appshell/settings/wallet')({
  component: WalletSettings,
})

function WalletSettings() {
  const [error, setError] = useState<string | null>(null)
  const { connected, address, disconnect } = useWallet()

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnect()
    } catch (err) {
      setError('Failed to disconnect wallet')
    }
  }

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
              <Button
                variant="secondary"
                onClick={handleDisconnectWallet}
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </SettingsPage>
  )
}
