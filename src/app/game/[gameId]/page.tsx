'use client';

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Game, IGame } from "../../../../lib/models/Game";
import { GameTitle } from "@/components/GameTitle";
import { Note } from "@/types/Note";
import { NoteCard } from "@/components/NoteCard";
import { WelcomeUser } from "@/components/WelcomeUser";
import NoteModal from "@/components/NoteModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Toast } from "@/components/Toast";
import { generateNoteTitle } from "@/lib/noteUtils";

const GameDetailsPage = () => {

    const router = useRouter();
    const [game, setGame] = useState<IGame | null>(null);
    const [userGameNotes, setUserGameNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [confirmingDeleteNote, setConfirmingDeleteNote] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

    // 1. Get the currently logged-in user's session
    const { status } = useSession();

    //2 Get the params from the URL
    const params = useParams();
    console.log(params);

    // 3. Get gameId from query parameters
    const gameId = params.gameId as string;

    useEffect(() => {

        const fetchGameData = async () => {
            try {
                setLoading(true);

                // Check if game is registered and get game details
                const gameRes = await fetch(`/api/users/games/${gameId}`);
                if (!gameRes.ok) {
                    const errorData = await gameRes.json();
                    throw new Error(errorData.error || "Game fetch failed");
                }
                const gameData = await gameRes.json();
                setGame(gameData.game);

                // Fetch notes for this game
                const notesRes = await fetch(`/api/users/notes?gameId=${gameId}`);
                if (notesRes.ok) {
                    const notesData = await notesRes.json();
                    setUserGameNotes(notesData.notes || []);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                router.push("/?error=game-not-registered");
            } finally {
                setLoading(false);
            }
        };

        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status === "authenticated" && gameId) {
            fetchGameData();
        }
    }, [status, gameId, router]);

    const handleNoteCreate = async (content: string, title?: string, noteId?: string) => {
        try {
            if (noteId) {
                // Edit existing note
                // Generate title if not provided (same logic as creating new notes)
                const finalTitle = title || generateNoteTitle(content);

                const res = await fetch(`/api/users/notes/${noteId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content,
                        title: finalTitle,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setUserGameNotes(prev =>
                        prev.map(note => note._id.toString() === noteId ? data.note : note)
                    );
                    setEditingNote(null);
                } else {
                    console.error('Failed to update note');
                }
            } else {
                // Create new note
                // Generate title if not provided
                const finalTitle = title || generateNoteTitle(content);

                const res = await fetch('/api/users/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        gameId,
                        content,
                        title: finalTitle,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setUserGameNotes(prev => [data.note, ...prev]);
                } else {
                    console.error('Failed to create note');
                }
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    }

    const handleNoteEdit = (note: Note) => {
        setEditingNote(note);
        setModalOpen(true);
    }

    const handleNoteDelete = (note: Note) => {
        setConfirmingDeleteNote(note);
    }

    const handleConfirmDelete = async () => {
        if (!confirmingDeleteNote) return;

        try {
            setIsDeleting(true);
            const res = await fetch(`/api/users/notes/${confirmingDeleteNote._id.toString()}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                setUserGameNotes(prev =>
                    prev.filter(note => note._id.toString() !== confirmingDeleteNote._id.toString())
                );
                setConfirmingDeleteNote(null);
                setToast({ message: 'Note deleted successfully', type: 'success' });
            } else {
                console.error('Failed to delete note');
                setToast({ message: 'Failed to delete note', type: 'error' });
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            setToast({ message: 'Error deleting note', type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            {loading ? (
                <div className="text-center text-xl text-zinc-900">Loading...</div>
            ) : error ? (
                <div className="text-center text-lg text-zinc-900">Error: {error}</div>
            ) : !game ? (
                <div className="text-center text-lg text-zinc-900">Game not found</div>
            ) : (
                <div className="relative top-14 flex flex-col items-center justify-start flex-1 gap-16 font-sans">
                    <div className="relative flex flex-col items-center flex-1 gap-10">
                        <GameTitle game={game || { title: "Loading..." }} />
                        <WelcomeUser />
                    </div>
                    <main className="flex flex-wrap gap-4 justify-center flex-row max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[55vh] overflow-y-auto">
                        {/* Notes section */}

                        {/* Always render one “Register a new game” card */}
                        <div onClick={() => setModalOpen(true)}>
                            <NoteCard />
                        </div>

                        {/* Render each registered note */}
                        {[...userGameNotes] // spread registeredGames into a new array, to avoid mutating the original array that's tracked by React's state (might mess with it otherwise)
                            .sort((a, b) => new Date(b.lastEditedOn).getTime() - new Date(a.lastEditedOn).getTime())
                            .map((note) => (
                                <NoteCard
                                    key={note._id.toString()}
                                    note={note}
                                    onEdit={() => handleNoteEdit(note)}
                                    onDelete={() => handleNoteDelete(note)}
                                />
                            ))}
                    </main>
                </div>
            )}
            <NoteModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingNote(null);
                }}
                onSave={handleNoteCreate}
                noteId={editingNote?._id.toString()}
                initialTitle={editingNote?.title}
                initialContent={editingNote?.content}
            />
            <ConfirmationModal
                isOpen={!!confirmingDeleteNote}
                title="Deleting Note"
                message="Are you sure you want to delete this note? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onClose={() => setConfirmingDeleteNote(null)}
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={isDeleting}
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDone={() => setToast(null)}
                />
            )}
        </>
    );
};

export default GameDetailsPage; // this needs to be default, because that's how Next.js knows to look for and import it