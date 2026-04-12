"use client";

import { AlertMessage } from "@/components/AlertMessage";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const RequestGamePage = () => {
    const router = useRouter();
    const { status } = useSession();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [gameTitle, setGameTitle] = useState("");
    const [message, setMessage] = useState("");

    const [alert, setAlert] = useState<null | {
        id: number;
        message: string;
        variant: "error" | "success" | "warning" | "info";
    }>(null);

    const handleAlertDone = useCallback(() => {
        setAlert(null);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status === "authenticated") {
            setLoading(false);
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitting(true);

        try {
            const res = await fetch("/api/contact/requestGame", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameTitle,
                    message,
                }),
            });

            if (res.ok) {
                setAlert({
                    id: Date.now(),
                    message: "Your request has been sent successfully.",
                    variant: "success",
                });

                setGameTitle("");
                setMessage("");
            } else {
                const isDev = process.env.NODE_ENV === "development";
                let message = "Failed to send new game request.";

                if (isDev) {
                    const data = await res.json().catch(() => null);
                    message = data?.error || "Failed to send new game request (server).";
                }
                setAlert({
                    id: Date.now(),
                    message,
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error sending game request:", error);

            setAlert({
                id: Date.now(),
                message: "Something went wrong. Please try again.",
                variant: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="dark:text-[#d4d4d8]">
                <div className="flex flex-col items-center justify-center mt-20 text-center gap-4">
                    <div className="text-xl text-[#111827] dark:text-[#d4d4d8]">
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dark:text-[#d4d4d8]">
            <div className="flex flex-col items-center justify-center mt-25 text-center gap-6 px-4">
                <div
                    className="flex flex-col px-4 py-3 gap-4 rounded-lg border border-stone-700 dark:border-none
                    shadow-xl dark:shadow-none bg-[#b68945]/75 dark:bg-neutral-800/65"
                >
                    <h1 className="text-2xl font-semibold text-[#111827] dark:text-[#d4d4d8]">
                        Request a game
                    </h1>

                    <p className="max-w-md text-stone-700 dark:text-zinc-300">
                        Don&apos;t see a game you&apos;re interested in? Send a request and I&apos;ll review it for inclusion.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-md">
                    <div className="w-full flex flex-col gap-1">
                        <input
                            type="text"
                            name="gameTitle"
                            placeholder="Game title"
                            value={gameTitle}
                            onChange={(e) => setGameTitle(e.target.value)}
                            required
                            maxLength={100}
                            className="
                                w-full border p-2 rounded
                                bg-[#f5f5f4] text-[#111827] border-stone-700
                                focus:outline-2 focus:outline-[#836e5e]/70
                                dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29]
                                dark:focus:outline-2 dark:focus:outline-zinc-400
                            "
                            autoComplete="off"
                        />

                        <div
                            className={`text-right text-xs ${gameTitle.length > 90
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-stone-600 dark:text-zinc-400"
                                }`}
                        >
                            {gameTitle.length}/100
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <textarea
                            name="message"
                            placeholder="Optional details, alternative titles, release year, etc."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            maxLength={200}
                            className="
                                w-full border p-2 rounded resize-none
                                bg-[#f5f5f4] text-[#111827] border-stone-700
                                focus:outline-2 focus:outline-[#836e5e]/70
                                dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29]
                                dark:focus:outline-2 dark:focus:outline-zinc-400
                            "
                        />

                        <div
                            className={`text-right text-xs ${message.length > 185
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-stone-600 dark:text-zinc-400"
                                }`}
                        >
                            {message.length}/200
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="
                                w-full px-4 py-2 border rounded-md
                                text-[#111827] bg-[#d64d0c] border-stone-700
                                focus:outline-2 focus:outline-[#cc3600]
                                hover:bg-[#be3300] active:bg-[#cc470c]
                                dark:text-zinc-300 dark:bg-[#441901]
                                dark:hover:bg-[#612905] dark:active:bg-[#542204]
                                dark:focus:outline-2 dark:focus:outline-zinc-700
                                hover:cursor-pointer
                            "
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !gameTitle.trim()}
                            className="
                                w-full px-4 py-2 rounded-md
                                border border-stone-700 dark:border-zinc-500
                                bg-[#c59854] dark:bg-neutral-600
                                text-[#111827] dark:text-zinc-300
                                focus:outline-2 focus:outline-[#867162] dark:focus:outline-2 dark:focus:outline-[#494951]
                                hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                                active:bg-[#ad803c] dark:active:bg-[#393939]
                                disabled:hover:bg-[#c59854] dark:disabled:hover:bg-neutral-600
                                hover:cursor-pointer
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            {submitting ? "Sending..." : "Send request"}
                        </button>
                    </div>
                </form>

                {alert && (
                    <AlertMessage
                        key={alert.id}
                        message={alert.message}
                        variant={alert.variant}
                        onDone={handleAlertDone}
                    />
                )}
            </div>
        </div>
    );
};

export default RequestGamePage;