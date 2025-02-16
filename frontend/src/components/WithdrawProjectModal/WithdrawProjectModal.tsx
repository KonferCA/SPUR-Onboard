import { Dialog } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

interface WithdrawProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

export function WithdrawProjectModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isLoading
}: WithdrawProjectModalProps) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onConfirm();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto w-[400px] rounded-lg bg-white">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <Dialog.Title className="text-lg font-medium">
                            Withdraw Application?
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <p className="text-gray-600">
                            Your application will be withdrawn from consideration for funding and you will no longer be able to make any changes.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Processing...' : 'Yes, withdraw it'}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 