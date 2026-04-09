'use client';

import React, { useState, useEffect } from 'react';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string, title?: string, noteId?: string) => void;
    noteId?: string;
    initialTitle?: string;
    initialContent?: string;
}

const NoteModal: React.FC<NoteModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    noteId, 
    initialTitle = '', 
    initialContent = '' 
}) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (noteId) {
                // Edit mode: use initial values
                setContent(initialContent);
                setTitle(initialTitle);
            } else {
                // Create mode: clear fields
                setContent('');
                setTitle('');
            }
        }
    }, [isOpen, noteId, initialTitle, initialContent]);

    const handleSave = () => {
        if (content.trim()) {
            onSave(content, title.trim() || undefined, noteId);
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const maxCharNum = 17;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                    {noteId ? 'Edit Note' : 'Add New Note'}
                </h2>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`Note title (${maxCharNum} characters max)`}
                    maxLength={maxCharNum}
                    className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100 mb-3"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full h-32 p-3 border border-zinc-300 dark:border-zinc-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!content.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;