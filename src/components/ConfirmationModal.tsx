'use client';

import React, { useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    cancelText?: string;
    /** When true, renders the confirm button in red to warn of destructive actions */
    isDestructive?: boolean;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    isLoading = false,
}) => {
    // Close on Escape / confirm on Enter
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && !isLoading) onConfirm();
        }

        if (!isOpen) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, isLoading, onConfirm]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="rounded-lg p-20 w-full max-w-2xl aspect-[3/2] relative overflow-hidden flex items-center justify-center">
            
                {/* ✅ Background image layer */}
                <div className="absolute inset-0 bg-[url('/BurningNote.png')] bg-center bg-cover dark:brightness-50" />
                <div className="p-6 w-full max-w-4/5 relative z-10">
                    <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-300">
                        {title}
                    </h2>
                    <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-6">
                        {message}
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 border rounded-md border-stone-700 text-[#111827] bg-[#c59854] focus:outline-2 focus:outline-[#867162] hover:bg-[#b68945] active:bg-[#ad803c] disabled:hover:bg-[#c59854] disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-500 dark:bg-[#5d4727] dark:text-zinc-300 dark:focus:outline-zinc-700 dark:hover:bg-[#6c522e] dark:active:bg-[#654d2b] dark:disabled:hover:bg-[#5d4727] hover:cursor-pointer"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 border rounded-md text-[#111827] border-stone-700 focus:outline-2 disabled:opacity-50 dark:text-zinc-300 dark:focus:outline-zinc-700 disabled:cursor-not-allowed hover:cursor-pointer ${isDestructive
                                    ? 'bg-[#d64d0c] hover:bg-[#be3300] active:bg-[#cc470c] disabled:hover:bg-[#d64d0c] focus:outline-[#cc3600] dark:bg-[#441901] dark:hover:bg-[#612905] dark:active:bg-[#542204] dark:disabled:hover:bg-[#441901]'
                                    : 'bg-[#3284fe] hover:bg-[#2974e5] active:bg-[#2f7bec] disabled:hover:bg-[#3284fe] focus:outline-[#0040cc] dark:bg-[#0b1f3a] dark:hover:bg-[#0f2a4d] dark:active:bg-[#0d2544] dark:disabled:hover:bg-[#0b1f3a]'
                                }`}
                        >
                            {isLoading ? '...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;