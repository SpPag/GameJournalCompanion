"use client";

import { AlertMessage } from "@/components/AlertMessage";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const ForgotPasswordPage = () => {
    const router = useRouter();

    // Get the currently logged-in user's session
    const { status } = useSession();

    // State for user input, forgot password request loading state, session loading state and alert messages
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [forgotResetRequestLoading, setForgotResetRequestLoading] = useState(false);
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

    // Handle forgot password form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        try {
            setForgotResetRequestLoading(true);

            // Call forgot password API route
            const res = await fetch("/api/auth/forgotPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            // Show alert based on response
            if (res.ok) {
                setAlert({
                    id: Date.now(),
                    message: "If an account with that email exists, a reset link has been sent.",
                    variant: "success",
                });
            } else {
                const isDev = process.env.NODE_ENV === "development";
                let message = "Failed to send password reset email.";

                if (isDev) {
                    const data = await res.json().catch(() => null);
                    message = data?.error || "Failed to send password reset email (server).";
                }
                setAlert({
                    id: Date.now(),
                    message,
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            setAlert({
                id: Date.now(),
                message: "Something went wrong. Please try again.",
                variant: "error",
            });
        } finally {
            setForgotResetRequestLoading(false);
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
            <div className="flex flex-col items-center justify-center gap-6 px-4 mt-25 text-center">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center gap-4 w-full max-w-sm"
                >
                    <div
                        className="
                            flex flex-col gap-4
                            px-4 py-3
                            border rounded-lg border-stone-700
                            bg-[#b68945]/75 shadow-xl
                            dark:border-none
                            dark:bg-neutral-800/65 dark:shadow-none
                        ">
                        <h1 className="text-2xl text-[#111827] font-semibold dark:text-[#d4d4d8]">
                            Forgot your password?
                        </h1>

                        <p className="max-w-md text-stone-700 dark:text-zinc-300">
                            Enter your email address and we&apos;ll send you a password reset link.
                        </p>
                    </div>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                            w-full p-2
                            text-[#111827]
                            border rounded border-stone-700
                            bg-[#f5f5f4]
                            focus:outline-2 focus:outline-[#836e5e]/70
                            dark:text-[#d4d4d8]
                            dark:border-zinc-500
                            dark:bg-[#312d29]
                            dark:focus:outline-zinc-400
                        "
                        autoComplete="email"
                    />

                    <div className="flex gap-4 w-full h-[3.8rem] ">
                        <button
                            type="submit"
                            disabled={forgotResetRequestLoading}
                            className="
                                w-1/2 h-full m-auto
                                text-[#111827]
                                border rounded-lg border-stone-700
                                bg-[#c59854]
                                hover:bg-[#b68945] hover:cursor-pointer
                                active:bg-[#ad803c]
                                focus:outline-2 focus:outline-[#867162]
                                disabled:bg-[#c59854] disabled:opacity-50 disabled:cursor-not-allowed
                                dark:text-zinc-300
                                dark:border-zinc-500
                                dark:bg-neutral-600
                                dark:hover:bg-[#4b4b4b]
                                dark:active:bg-[#393939]
                                dark:focus:outline-[#494951]
                                dark:disabled:bg-neutral-600
                            "
                        >
                            {forgotResetRequestLoading ? "Sending..." : "Send reset link"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="
                                w-1/2 py-2 m-auto
                                text-[#111827]
                                border rounded-lg border-stone-700
                                bg-[#c59854]
                                hover:bg-[#b68945] hover:cursor-pointer
                                active:bg-[#ad803c]
                                focus:outline-2 focus:outline-[#867162]
                                dark:text-zinc-300
                                dark:border-zinc-500
                                dark:bg-neutral-600
                                dark:hover:bg-[#4b4b4b]
                                dark:active:bg-[#393939]
                                dark:focus:outline-[#494951]
                            "
                        >
                            Back to login
                        </button>
                    </div>

                    {alert && (
                        <AlertMessage
                            key={alert.id}
                            message={alert.message}
                            variant={alert.variant}
                            onDone={() => setAlert(null)}
                        />
                    )}
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;