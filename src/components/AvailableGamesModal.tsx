'use client';

import { useEffect, useState } from "react";
import { Game } from "@/types/Game";
import { GameCard } from "./GameCard";
import React from "react";

interface AvailableGamesModalProps {
  onClose: () => void;
  onRegistered: () => void;
}

const AvailableGamesModal = ({ onClose, onRegistered }: AvailableGamesModalProps) => {
  const [available, setAvailable] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the list of games the user hasn’t registered yet
  useEffect(() => {
    setLoading(true);
    fetch("/api/games/available")
      .then((res) => res.json())
      .then((data) => setAvailable(data.availableGames || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-3xl mx-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl mb-4">Pick a Game to Register</h2>
        {loading && <p>Loading…</p>}
        <div className="grid grid-cols-3 gap-4">
          {available.map((g) => (
            <div key={g._id} onClick={() => registerGame(g._id)}>
              <GameCard game={g} />
              <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded">
                Register
              </button>
            </div>
          ))}
          {available.length === 0 && !loading && (
            <p>No more games to register!</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export { AvailableGamesModal }