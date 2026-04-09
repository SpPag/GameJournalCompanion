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
    // Close on Escape
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-sm mx-4">
                <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-6">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-zinc-600 dark:disabled:hover:text-zinc-400"
                    >
                        {cancelText} 
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDestructive
                                ? 'bg-red-500 hover:bg-red-600 disabled:hover:bg-red-500'
                                : 'bg-blue-500 hover:bg-blue-600 disabled:hover:bg-blue-500'
                        }`}
                    >
                        {isLoading ? '...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
