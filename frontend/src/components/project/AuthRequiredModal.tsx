import { FiX } from 'react-icons/fi';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: 'like' | 'share';
}

// TODO: fix design inconsistencies with other modals + figma
export function AuthRequiredModal({
    isOpen,
    onClose,
    action,
}: AuthRequiredModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClose();
                    }
                }}
                role="button"
                tabIndex={0}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Oops! You need an account for that
                        </h2>

                        <p className="text-gray-600 mb-6">
                            To {action} projects, you'll need to create an
                            account or sign in.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <a
                            href="/auth?mode=register"
                            className="w-full bg-button-primary-100 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-button-primary-200 transition-colors block text-center"
                        >
                            Create Account
                        </a>
                        <a
                            href="/auth?mode=login"
                            className="w-full bg-white text-button-primary-100 py-2.5 px-4 rounded-lg font-medium border border-button-primary-100 hover:bg-button-primary-25 transition-colors block text-center"
                        >
                            Sign In
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full text-gray-600 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
