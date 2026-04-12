"use client";

import { AlertMessage } from "@/components/AlertMessage";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const ResetPasswordClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get reset token from query params
    const token = searchParams.get("token");

    // Get the currently logged-in user's session
    const { status } = useSession();

    // State for password inputs, reset request loading state, session loading state and alert messages
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [resetLoading, setResetLoading] = useState(false);
    const [alert, setAlert] = useState<null | {
        id: number;
        message: string;
        variant: "error" | "success" | "warning" | "info";
    }>(null);

    // Handle session state:
    //      - redirect authenticated users to home page
    //      - allow unauthenticated users to view this page
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/");
            return;
        }

        if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, router]);

    // Handle reset password form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Guard against missing token
        if (!token) {
            setAlert({
                id: Date.now(),
                message: "Invalid or missing reset token.",
                variant: "error",
            });
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setAlert({
                id: Date.now(),
                message: "Password must be at least 8 characters long.",
                variant: "error",
            });
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            setAlert({
                id: Date.now(),
                message: "Passwords do not match.",
                variant: "error",
            });
            return;
        }

        try {
            setResetLoading(true);

            // Call reset password API route
            const res = await fetch("/api/auth/resetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            if (res.ok) {
                router.push("/login?reset=true");
            } else {
                const isDev = process.env.NODE_ENV === "development";
                let message = "Failed to reset password.";

                if (isDev) {
                    const data = await res.json().catch(() => null);
                    message = data?.error || "Failed to reset password (server).";
                }
                setAlert({
                    id: Date.now(),
                    message,
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Reset password error:", error);
            setAlert({
                id: Date.now(),
                message: "Something went wrong. Please try again.",
                variant: "error",
            });
        } finally {
            setResetLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dark:text-[#d4d4d8]">
                <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center">
                    <div className="text-xl text-[#111827] dark:text-[#d4d4d8]">
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dark:text-[#d4d4d8]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
                <div
                    className="
                        flex flex-col gap-4
                        px-4 py-3
                        border rounded-lg border-stone-700
                        bg-[#b68945]/75 shadow-xl
                        dark:border-none
                        dark:bg-neutral-800/65
                        dark:shadow-none
                    ">
                    <h1 className="text-2xl text-center font-semibold">
                        Reset your password
                    </h1>

                    <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">
                        Enter your new password below.
                    </p>
                </div>

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                        p-2
                        text-[#111827]
                        border rounded border-stone-700
                        bg-[#f5f5f4]
                        focus:outline-2 focus:outline-[#836e5e]/70
                        dark:text-[#d4d4d8]
                        dark:border-zinc-500
                        dark:bg-[#312d29]
                        dark:focus:outline-zinc-400
                    "
                    autoComplete="new-password"
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="
                        p-2
                        text-[#111827]
                        border rounded border-stone-700
                        bg-[#f5f5f4]
                        focus:outline-2 focus:outline-[#836e5e]/70
                        dark:text-[#d4d4d8]
                        dark:border-zinc-500
                        dark:bg-[#312d29]
                        dark:focus:outline-zinc-400
                    "
                    autoComplete="new-password"
                />

                <div className="flex gap-4 h-[3.8rem]">
                    <button
                        type="submit"
                        disabled={resetLoading}
                        className="
                            w-1/2 h-full m-auto
                            border rounded-lg border-stone-700
                            text-[#111827]
                            bg-[#c59854]
                            hover:bg-[#b68945] hover:cursor-pointer
                            active:bg-[#ad803c]
                            focus:outline-2 focus:outline-[#867162]
                            disabled:bg-[#c59854] disabled:opacity-50 disabled:cursor-not-allowed
                            dark:border-zinc-500
                            dark:text-zinc-300
                            dark:bg-neutral-600
                            dark:hover:bg-[#4b4b4b]
                            dark:active:bg-[#393939]
                            dark:focus:outline-[#494951]
                            disabled:dark:bg-neutral-600
                        "
                    >
                        {resetLoading ? "Resetting..." : "Reset password"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="
                            w-1/2 py-2 m-auto
                            border rounded-lg border-stone-700
                            text-[#111827]
                            bg-[#c59854]
                            hover:bg-[#b68945] hover:cursor-pointer
                            active:bg-[#ad803c]
                            focus:outline-2 focus:outline-[#867162]
                            dark:border-zinc-500
                            dark:text-zinc-300
                            dark:bg-neutral-600
                            dark:hover:bg-[#4b4b4b]
                            dark:active:bg-[#393939]
                            dark:focus:outline-[#494951]
                        "
                    >
                        Back to login
                    </button>
                </div>
            </form>

            {alert && (
                <AlertMessage
                    key={alert.id}
                    message={alert.message}
                    variant={alert.variant}
                    onDone={() => setAlert(null)}
                />
            )}
        </div>
    );
};

export default ResetPasswordClient;