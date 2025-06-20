'use client';

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Game, IGame } from "../../../../lib/models/Game";
import { GameTitle } from "@/components/GameTitle";
import { INote, Note } from "../../../../lib/models/Note";
import { NoteCard } from "@/components/NoteCard";
import { WelcomeUser } from "@/components/WelcomeUser";

const GameDetailsPage = () => {

    const router = useRouter();
    const [game, setGame] = useState<IGame | null>(null);
    const [userGameNotes, setUserGameNotes] = useState<INote[]>([]);
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
                // fetch(`/api/users/games/${gameId}`)
                //     .then(res => console.log("API response status:", res.status))
                //     .catch(err => console.error("API call failed:", err));
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
            router.push("/login");
            return;
        }

        if (status === "authenticated" && gameId) {
            fetchGameData();
        }
    }, [status, gameId, router]);

    const handleNoteCreate = () => {

    }

    const handleNoteEdit = () => {

    }

    const handleNoteDelete = () => {

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

                        {/* Render each registered note */}
                        {[...userGameNotes] // spread registeredGames into a new array, to avoid mutating the original array that's tracked by React's state (might mess with it otherwise)
                            .sort((a, b) => a.lastEditedOn.getDate() - b.lastEditedOn.getDate())
                            .map((note) => (
                                <div key={note._id.toString()}>
                                    {/* Delete icon top - right of the card */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNoteDelete();
                                        }}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                                    >
                                        <svg
                                            className="h-8 w-8 text-neutral-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" />
                                            <line x1="4" y1="7" x2="20" y2="7" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                        </svg>
                                    </button>

                                    {/* Edit icon top - right of the card, on the left of the delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNoteEdit();
                                        }}
                                        className="absolute top-2 right-4 text-gray-600 hover:text-gray-800 cursor-pointer"
                                    >
                                        {/* Option 1 */}
                                        <svg fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                            viewBox="0 0 497.616 497.616" xmlSpace="preserve">
                                            <g id="XMLID_116_">
                                                <path id="XMLID_118_" d="M470.314,392.915l-40.059-0.264c-0.043,0-0.083,0-0.117,0c-9.308,0-16.885,7.512-16.944,16.828
                                                c-0.058,9.365,7.473,16.993,16.829,17.06l18.814,0.123c-5.874,10.357-16.995,17.357-29.727,17.383h-0.141
                                                c-18.814-0.049-34.112-15.356-34.112-34.186V284.557c-10.441,8.107-21.918,16.232-33.888,23.258v102.044
                                                c0,12.51,3.631,24.101,9.546,34.186H179.634c-23.969,0-43.461-19.492-43.461-43.46V87.755c0-12.508-3.631-24.1-9.548-34.185
                                                h180.883c23.969,0,43.462,19.493,43.462,43.46v13.478c10.556-8.033,21.634-15.694,32.927-22.992
                                                c-4.756-38.133-36.999-67.834-76.389-67.834c0,0-239.881,0.049-239.964,0.049C30.255,20.03,0,50.409,0,87.755
                                                c0,9.317,7.519,16.886,16.829,16.944l40.059,0.266c0.042,0,0.083,0,0.117,0c9.308,0,16.885-7.513,16.944-16.829
                                                c0.058-9.365-7.473-16.993-16.829-17.059l-18.815-0.125C44.18,60.594,55.3,53.594,68.032,53.57h0.141
                                                c18.814,0.049,34.112,15.355,34.112,34.185v312.83c0,42.649,34.7,77.349,77.35,77.349c0,0,239.881-0.049,239.964-0.049
                                                c37.288-0.299,67.544-30.68,67.544-68.026C487.143,400.544,479.621,392.972,470.314,392.915z"/>
                                                <path id="XMLID_117_" d="M495.291,70.348c-1.521-1.521-3.548-2.316-5.6-2.316c-1.183,0-2.382,0.264-3.492,0.81
                                                c-34.293,16.846-104.104,53.803-143.586,93.292c-43.767,43.758-71.74,89.8-71.565,114.497l-26.989,26.988l-34.235,34.235
                                                l41.93-5.989l10.358-10.358l26.923-26.922c0.074,0,0.132,0.032,0.206,0.032c24.738,0,70.64-27.957,114.266-71.583
                                                c14.163-14.163,27.962-32.273,40.664-51.204l-9.201-9.2l15.199-0.009c3.433-5.32,6.791-10.615,10.011-15.926l-17.226-5.039
                                                l25.631-9.233c11.781-20.468,21.593-39.49,28.22-52.984C498.304,76.396,497.684,72.739,495.291,70.348z"/>
                                            </g>
                                        </svg>
                                        {/* Option 2 */}
                                        {/* <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 1024 1024"
                                            fill="currentColor"
                                            stroke="none"
                                            className="w-8 h-8 text-neutral-500"
                                        >
                                            <path d="M 480 851 L 479 852 L 455 852 L 454 853 L 440 853 L 439 854 L 430 854 L 429 855 L 421 855 L 420 856 L 414 856 L 413 857 L 408 857 L 407 858 L 403 858 L 402 859 L 398 859 L 397 860 L 395 860 L 394 861 L 391 861 L 390 862 L 389 862 L 388 863 L 386 863 L 385 864 L 384 864 L 383 865 L 382 865 L 381 866 L 380 866 L 379 867 L 378 867 L 376 869 L 375 869 L 369 875 L 369 876 L 367 878 L 367 880 ..." />
                                        </svg> */}
                                    </button>
                                    <NoteCard note={note} />
                                </div>
                            ))}

                        {/* Always render one “Register a new game” card */}
                        <div>
                            <NoteCard />
                        </div>
                    </main>
                </div>
            )}
        </>
    );
};

export default GameDetailsPage; // this needs to be default, because that's how Next.js knows to look for and import it