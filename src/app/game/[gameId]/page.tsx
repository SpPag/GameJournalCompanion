'use client';

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Game, IGame } from "../../../../lib/models/Game";
import { GameTitle } from "@/components/GameTitle";
import { INote, Note } from "../../../../lib/models/Note";

const GameDetailsPage = () => {

    const router = useRouter();
    const [game, setGame] = useState<IGame | null>(null);
    const [notes, setNotes] = useState<INote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Get the currently logged-in user's session
    const { data: session, status } = useSession();

    //2 Get the params from the URL
    const params = useParams();
    console.log(params);

    // 3. Get gameId from query parameters
    const gameId = params.gameId as string;

    useEffect(() => {

        const fetchGameData = async () => {
            try {
                setLoading(true);
                //=====================DEBUG=====================
                // console.log("Calling API with gameId:", gameId); // Check browser's Console
                // const debugRes = await fetch(`/api/users/games/${gameId}`);
                // console.log("Debug status:", debugRes.status);
                //=====================DEBUG=====================

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
                    setNotes(notesData.notes || []);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                router.push("/?error=game-not-registered");
            } finally {
                setLoading(false);
            }
        };
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && gameId) {
            fetchGameData();
        }
    }, [status, gameId, router]);



    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!game) {
        return <div>Game not found</div>;
    }

    return (
        <div>
            <div>
                <GameTitle game={game} />
                {/* Notes section */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Your Notes</h2>
                    {notes.length === 0 ? (
                        <p>No notes yet. Add your first note!</p>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note) => (
                                <div key={note._id.toString()} className="p-4 border rounded-lg">
                                    <p>{note.content}</p>
                                    <small className="text-gray-500">
                                        Last edited: {new Date(note.lastEditedOn).toLocaleString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameDetailsPage; // this needs to be default, because that's how Next.js knows to look for and import it