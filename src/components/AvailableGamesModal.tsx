'use client';

import React, { useEffect, useState } from "react";
import { Game } from "@/types/Game";
import { GameCard } from "./GameCard";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";

interface AvailableGamesModalProps {
  onClose: () => void;
  onRegistered: () => void;
  onRegisterSuccess?: () => void;
}

const AvailableGamesModal = ({ onClose, onRegistered, onRegisterSuccess }: AvailableGamesModalProps) => {
  const [available, setAvailable] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  // Fetch the list of games the user hasn’t registered yet. Returns 401 if the user isn't authenticated
  useEffect(() => {
    setLoading(true);

    fetch("/api/games/available")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        setAuthenticated(true);

        const data = await res.json();
        setAvailable(data.availableGames || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // When a user clicks one to register
  const registerGame = async (gameId: string) => {
    const res = await fetch("/api/users/register-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    if (res.ok) {
      onRegisterSuccess?.();
      onRegistered();
    } else {
      setToast({ message: "Error registering game", type: "error" });
    }
  };

  return (
    <>
      {authenticated && (
        <>
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
          >
            <div
              className="bg-stone-400 dark:bg-zinc-900 rounded-lg w-full max-w-[52rem] max-h-[75vh] mx-4 border border-stone-600 dark:border-none flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top content */}
              <div className="p-6 pb-4 shrink-0">
                {loading && <p>Loading…</p>}

                {/* {!loading && (
                  <p className="text-[#111827] dark:text-zinc-300">
                    Don&apos;t see the game you want?
                  </p>
                )} */}
              </div>

              {/* Scrollable middle area */}
              <div className="flex-1 overflow-y-auto px-6">
                <div className="flex flex-wrap gap-4 min-w-[20rem] w-full pb-4 justify-center">
                  {available.map((game) => (
                    <div key={game._id} onClick={() => registerGame(game._id)}>
                      <GameCard game={game} showDelete={false} />
                    </div>
                  ))}

                  {available.length === 0 && !loading && (
                    <p className="text-[#111827] dark:text-zinc-300">
                      No available games right now. Feel free to request one using the button below.
                    </p>
                  )}
                </div>
              </div>

              {/* Fixed bottom action row */}
              <div className="shrink-0 flex items-center justify-between p-6 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border-2 rounded-md bg-[#d64d0c] text-[#111827] border-stone-700 focus:outline focus:outline-[#cc3600] hover:bg-orange-700 active:bg-[#cc470c] dark:bg-[#441901] dark:hover:bg-[#612905] dark:active:bg-[#542204] dark:text-zinc-300 dark:focus:outline-1 dark:focus:outline-zinc-700 hover:cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <p className="text-[#111827] dark:text-zinc-300 whitespace-nowrap">
                    Don&apos;t see the game you want?
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/requestGame")}
                    className="
                      px-4 py-2 rounded-md
                      border border-stone-700 dark:border-neutral-600
                      bg-[#c59854] dark:bg-neutral-800
                      text-[#111827] dark:text-zinc-300
                      hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                      active:bg-[#ad803c] dark:active:bg-[#393939]
                      focus:outline-2 focus:outline-[#867162] dark:focus:outline-2 dark:focus:outline-zinc-500
                      hover:cursor-pointer
                    "
                  >
                    Request a game
                  </button>
                </div>
              </div>
            </div>
          </div>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onDone={() => setToast(null)}
            />
          )}
        </>
      )}
    </>
  );
};

export { AvailableGamesModal };