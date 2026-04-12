'use client';

import { AvailableGamesModal } from "@/components/AvailableGamesModal";
import { BookSvg } from "@/components/BookSvg";
import { GameCard } from "@/components/GameCard";
import { WelcomeUser } from "@/components/WelcomeUser";
import { Game } from "@/types/Game";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertMessage } from "@/components/AlertMessage";
import { useSession } from "next-auth/react";
import { AboutMessage } from "@/components/AboutMessage";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Toast } from "@/components/Toast";

export default function Home() {
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmingDeleteGame, setConfirmingDeleteGame] = useState<Game | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);
  const [showAlert, setShowAlert] = useState<null | { message: string; variant: "error" | "success" | "warning" | "info" }>(null); // I currently only use 'error' but I'm adding these here in case they're useful in the future. Expand freely
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Load the user's games when the component mounts
  useEffect(() => {
    if (status === "authenticated") {
      refreshGames();
    } else if (status === "unauthenticated") {
      setLoading(false); // Stop loading if the user isn't logged in
    }
  }, [status]);

  useEffect(() => {
    const error = searchParams.get('error');
    // I currently only use 'error' but I'm adding these here in case they're useful in the future. Expand freely by adding code like:
    /*

      const success = searchParams.get('success');
      const warning = searchParams.get('warning');
      const successMessages = {
        'registration-complete': 'Game registered successfully!',
      };

    */
    const errorMessages: Record<string, string> = {
      'game-not-registered': 'Game not registered!',
      // Add more error codes and messages here. Examples:
      // 'game-already-registered': 'Game already registered!',
      // 'unauthorized-access': 'You must be logged in to view that page.',
    };

    if (error) {
      const message = errorMessages[error] ?? 'An unknown error occurred.';
      setShowAlert({
        message,
        variant: "error"
      });
    }

    if (searchParams.get("accountDeleted") === "true") {
      setShowAlert({
        message: "Your account has been deleted successfully.",
        variant: "success"
      });
    }
  }, [searchParams]);

  // Function that re-checks user's registered games after game registration modal closes to make sure the appropriate GameCard instances are rendered
  const refreshGames = () => {
    setLoading(true); // Start loading
    fetch("/api/users/games")
      .then((res) => res.json())
      .then((data) => setUserGames(data.registeredGames || []))// Even if I know that every user on the database has at least an empty array as registeredGames' value, adding '|| []' guards against a server bug or network hiccup that would result in the response being someting like '{ "error": "Internal Server Error" }', which will set data.registeredGames to undefined, which would cause the app to crash since it would be unhandled. Same goes for if the app tries to access data.registeredGames before the fetch completes and populates it
      .catch(console.error)
      .finally(() => setLoading(false)); // Done loading;
  };

  const handleGameDelete = (game: Game) => {
    setConfirmingDeleteGame(game);
  };

  const handleConfirmDeleteGame = async () => {
    if (!confirmingDeleteGame) return;

    try {
      setIsDeleting(true);

      // Delete all notes associated with this game
      const notesRes = await fetch(`/api/users/notes?gameId=${confirmingDeleteGame._id}`);
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        const notes = notesData.notes || [];

        // Delete each note
        for (const note of notes) {
          await fetch(`/api/users/notes/${note._id.toString()}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }

      // Delete the game itself
      const res = await fetch(`/api/users/games/${confirmingDeleteGame._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setUserGames(prev =>
          prev.filter(game => game._id !== confirmingDeleteGame._id)
        );
        setConfirmingDeleteGame(null);
        setToast({ message: 'Game de-registered successfully', type: 'success' });
      } else {
        console.error('Failed to delete game');
        setToast({ message: 'Failed to de-register game', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      setToast({ message: 'Error de-registering game', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {showAlert && (
        <AlertMessage message={showAlert.message} variant={showAlert.variant} onDone={() => setShowAlert(null)} />
      )}
      <div className="relative mt-14 flex flex-col items-center justify-start flex-1 pt-8 font-sans">
        <div>
          <div className="
          flex items-center justify-center gap-4
          w-106 h-16 sm:w-106 sm:h-16 md:w-123 md:h-17 lg:w-141 lg:h-19
          border-2 rounded-xl border-zinc-500 dark:border-zinc-900
          text-2xl md:text-3xl lg:text-4xl
          text-zinc-950 dark:text-zinc-950
          shadow-xl dark:shadow-zinc-950/70
          dark:bg-white/10
          ">
            <BookSvg className="h-8 w-8" />
            <h1 className="italic pr-1">Game Journal Companion</h1>
            <BookSvg className="h-8 w-8" />
          </div>
          <WelcomeUser />
        </div>
        <main className="flex flex-col row-start-2 items-center sm:items-start mt-10">
          {loading ? (
            <div className="text-center text-lg text-zinc-900">Loading...</div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center flex-row max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[55vh] overflow-y-auto">
              {/* Always render one “Register a new game” card */}
              <div onClick={() => setIsGamesModalOpen(true)}>
                <GameCard />
              </div>
              {/* Render each registered game */}
              {[...userGames] // spread registeredGames into a new array, to avoid mutating the original array that's tracked by React's state (might mess with it otherwise)
                .sort((a, b) => a.title.toLocaleLowerCase().localeCompare(b.title)) // sort by name
                .map((game) => (
                  <div key={game._id} onClick={() => router.push(`/game/${game._id}`)}>
                    <GameCard game={game} onDelete={() => handleGameDelete(game)} />
                  </div>
                ))}
            </div>
          )}

          {/* The modal to pick & register a new game */}
          {isGamesModalOpen && (
            <AvailableGamesModal
              onClose={() => setIsGamesModalOpen(false)}
              onRegistered={() => {
                setIsGamesModalOpen(false);
                refreshGames();
              }}
              onRegisterSuccess={() => {
                setToast({ message: 'Game registered successfully!', type: 'success' });
              }}
            />
          )}
        </main>
        <AboutMessage />
      </div>
      <ConfirmationModal
        isOpen={!!confirmingDeleteGame}
        title="De-registering Game"
        message="Are you sure you want to de-register this game? All associated notes will also be deleted. This action cannot be undone."
        onConfirm={handleConfirmDeleteGame}
        onClose={() => setConfirmingDeleteGame(null)}
        confirmText="De-register"
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
}
