'use client';

import { useEffect, useState } from "react";
import { Game } from "@/types/Game";
import { GameCard } from "./GameCard";
import { useRouter } from "next/navigation";
import React from "react";

interface AvailableGamesModalProps {
  onClose: () => void;
  onRegistered: () => void;
}

const AvailableGamesModal = ({ onClose, onRegistered }: AvailableGamesModalProps) => {
  const [available, setAvailable] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // Fetch the list of games the user hasn’t registered yet. Returns 401 if the user isn't authenticated
  useEffect(() => {
    setLoading(true);
    fetch("/api/games/available")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setAuthenticated(true);
        const data = await res.json();
        setAvailable(data.availableGames || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  // When a user clicks one to register
  const registerGame = async (gameId: string) => {
    const res = await fetch("/api/users/register-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    if (res.ok) {
      onRegistered();
    } else {
      alert("Failed to register game.");
    }
  };

  return (
    <>
      {authenticated && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <div
            className="bg-stone-400 dark:bg-zinc-900 rounded-lg p-6 w-full max-w-[52rem] mx-4 overflow-auto border border-2 border-stone-600 dark:border-none"
            onClick={(e) => e.stopPropagation()}
          >
            {loading && <p>Loading…</p>}
            <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[80vh] min-w-[20rem] w-full p-4 items-center justify-start">
              {available.map((game) => (
                <div key={game._id} onClick={() => registerGame(game._id)}>
                  <GameCard game={game} />
                </div>
              ))}
              {available.length === 0 && !loading && (
                <p>No available games. Either I&apos;m failing you or you&apos;re an absolute beast!</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 border rounded bg-[#926d46] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#9a754e] active:bg-[#a17749] dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:bg-zinc-950 dark:active:bg-zinc-950 dark:text-zinc-300 dark:focus:outline-1 dark:focus:outline-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>)}
    </>
  );
}

export { AvailableGamesModal }