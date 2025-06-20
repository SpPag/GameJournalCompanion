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

export default function Home() {
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Load the user's games when the component mounts
  useEffect(() => {
    if (status === "authenticated") {
      refreshGames();
    } else if (status === "unauthenticated") {
      setLoading(false); // Stop loading if the user isn't logged in
    }
  }, [status]);

  // Function that re-checks user's registered games after game registration modal closes to make sure the appropriate GameCard instances are rendered
  const refreshGames = () => {
    setLoading(true); // Start loading
    fetch("/api/users/games")
      .then((res) => res.json())
      .then((data) => setUserGames(data.registeredGames || []))// Even if I know that every user on the database has at least an empty array as registeredGames' value, adding '|| []' guards against a server bug or network hiccup that would result in the response being someting like '{ "error": "Internal Server Error" }', which will set data.registeredGames to undefined, which would cause the app to crash since it would be unhandled. Same goes for if the app tries to access data.registeredGames before the fetch completes and populates it
      .catch(console.error)
      .finally(() => setLoading(false)); // Done loading;
  };

  const searchParams = useSearchParams();
  const [showAlert, setShowAlert] = useState<null | { message: string; variant: "error" | "success" | "warning" | "info" }>(null); // I currently only use 'error' but I'm adding these here in case they're useful in the future. Expand freely

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
      setShowAlert({ message, variant: "error" });
    }

  }, [searchParams]);

  return (
    <>
      {showAlert && (
        <AlertMessage message={showAlert.message} variant={showAlert.variant} onDone={() => setShowAlert(null)} />
      )}
      <div className="relative top-14 flex flex-col items-center justify-start flex-1 p-8 gap-10 font-[family-name:var(--font-geist-sans)]">
        <div>
          <div className="
          flex items-center justify-center gap-4 p-4
          w-106 h-16 sm:w-106 sm:h-16 md:w-123 md:h-17 lg:w-141 lg:h-19
          border border-2 rounded-xl border-zinc-500 dark:border-zinc-900
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
        <main className="flex flex-col row-start-2 items-center sm:items-start ">
          {loading ? (
            <div className="text-center text-lg text-zinc-900">Loading...</div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center flex-row max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[55vh] overflow-y-auto">
              {/* Render each registered game */}
              {[...userGames] // spread registeredGames into a new array, to avoid mutating the original array that's tracked by React's state (might mess with it otherwise)
                .sort((a, b) => a.title.toLocaleLowerCase().localeCompare(b.title)) // sort by name
                .map((game) => (
                  <div key={game._id} onClick={() => router.push(`/game/${game._id}`)}>
                    <GameCard game={game} />
                  </div>
                ))}

              {/* Always render one “Register a new game” card */}
              <div onClick={() => setIsModalOpen(true)}>
                <GameCard />
              </div>
            </div>
          )}

          {/* The modal to pick & register a new game */}
          {isModalOpen && (
            <AvailableGamesModal
              onClose={() => setIsModalOpen(false)}
              onRegistered={() => {
                setIsModalOpen(false);
                refreshGames();
              }}
            />
          )}
        </main>
        <AboutMessage />
      </div>
    </>
  );
}
