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

    const handleSave = () => {
        if (content.trim()) {
            onSave(content.trim(), title.trim() || undefined, noteId);
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
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
    >
        <div className="rounded-lg p-20 w-full max-w-2xl mx-4 relative overflow-hidden flex items-center justify-center">
            
            {/* ✅ Background image layer */}
            <div className="absolute inset-0 bg-[url('/NoteBackground_v2_NoBackground.png')] bg-center bg-cover dark:brightness-50" />

            {/* ✅ Content (on top of image) */}
            <div className="relative z-10">
                <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-300">
                    {noteId ? 'Edit Note' : 'Add New Note'}
                </h2>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSave();
                        }
                    }}
                    placeholder={`Note title (${maxCharNum} characters max)`}
                    maxLength={maxCharNum}
                    className="w-full p-3 border text-[#111827] border-zinc-300/50 focus:outline-2 focus:outline-[#836e5e]/70 dark:border-zinc-500 rounded-md bg-white/70 dark:bg-[#312d29]/80 dark:text-zinc-300 mb-3 dark:focus:outline-zinc-400"
                />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full h-32 p-3 border text-[#111827] border-zinc-300/50 focus:outline-2 focus:outline-[#836e5e]/70 dark:border-zinc-500 rounded-md bg-white/70 dark:bg-[#312d29]/80 dark:text-zinc-300 mb-3 dark:focus:outline-zinc-400 resize-y"
                />

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-[#111827] bg-[#d64d0c] border-stone-700 focus:outline-2 focus:outline-[#cc3600] hover:bg-[#be3300] active:bg-[#cc470c] dark:text-zinc-300 dark:bg-[#441901] dark:hover:bg-[#612905] dark:active:bg-[#542204] dark:focus:outline-zinc-700 hover:cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 border rounded-md text-[#111827] bg-[#b68945] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#ad803c] active:bg-[#b28541] disabled:hover:bg-[#b68945] dark:text-zinc-300 dark:bg-[#3b403a] dark:hover:bg-[#4e544d] dark:active:bg-[#434942] dark:disabled:hover:bg-[#3b403a] dark:focus:outline-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                        disabled={!content.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
);
};

export default NoteModal;