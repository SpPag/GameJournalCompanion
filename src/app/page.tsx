'use client';

import { AvailableGamesModal } from "@/components/AvailableGamesModal";
import { BookSvg } from "@/components/BookSvg";
import { GameCard } from "@/components/GameCard";
import { Game } from "@/types/Game";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Load the user's games when the component mounts
  useEffect(() => {
    refreshGames();
  }, []);

  // Function that re-checks user's registered games after game registration modal closes to make sure the appropriate GameCard instances are rendered
  const refreshGames = () => {
    fetch("/api/users/games")
      .then((res) => res.json())
      .then((data) => setUserGames(data.registeredGames || []))// Even if I know that every user on the database has at least an empty array as registeredGames' value, adding '|| []' guards against a server bug or network hiccup that would result in the response being someting like '{ "error": "Internal Server Error" }', which will set data.registeredGames to undefined, which would cause the app to crash since it would be unhandled. Same goes for if the app tries to access data.registeredGames before the fetch completes and populates it
      .catch(console.error);
  };

  return (
    <div className="relative top-14 flex flex-col items-center justify-start flex-1 p-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center justify-center gap-4 border border-2 rounded-xl w-106 h-16 sm:w-106 sm:h-16 md:w-123 md:h-17 lg:w-141 lg:h-19 text-2xl md:text-3xl lg:text-4xl border-zinc-500 shadow-xl p-4 text-zinc-950 dark:shadow-zinc-950/70 dark:border-zinc-900 dark:text-zinc-950 dark:bg-white/10">
        <BookSvg className="h-8 w-8" />
        <h1 className="italic pr-1">Game Journal Companion</h1>
        <BookSvg className="h-8 w-8" />
      </div>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {/* Render each registered game */}
          {userGames.map((game) => (
            <div key={game._id} onClick={() => router.push(`/game/${game._id}`)}>
              <GameCard key={game._id} game={game} />
            </div>
          ))}

          {/* Always render one “Register a new game” card */}
          <div onClick={() => setIsModalOpen(true)}>
            <GameCard />
          </div>
        </div>
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
    </div>
  );
}
