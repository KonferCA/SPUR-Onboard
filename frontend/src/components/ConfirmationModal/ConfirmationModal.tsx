import type React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { IoMdClose } from 'react-icons/io';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    primaryAction: () => void;
    primaryActionText?: string;
    secondaryActionText?: string;
    primaryButtonClassName?: string;
    secondaryButtonClassName?: string;
    showCloseButton?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    primaryAction,
    primaryActionText = 'Confirm',
    secondaryActionText = 'Cancel',
    primaryButtonClassName = '',
    secondaryButtonClassName = '',
    showCloseButton = true,
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/25"
                        aria-hidden="true"
                    />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="absolute right-6 top-6 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                    >
                                        <IoMdClose className="h-5 w-5" />
                                    </button>
                                )}

                                {title && (
                                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                                        {title}
                                    </Dialog.Title>
                                )}

                                {description && (
                                    <Dialog.Description>
                                        {description}
                                    </Dialog.Description>
                                )}

                                <div className="mt-4 text-base text-gray-600">
                                    {children}
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${secondaryButtonClassName}`}
                                        onClick={onClose}
                                    >
                                        {secondaryActionText}
                                    </button>

                                    <button
                                        type="button"
                                        className={`rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${primaryButtonClassName}`}
                                        onClick={primaryAction}
                                    >
                                        {primaryActionText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
