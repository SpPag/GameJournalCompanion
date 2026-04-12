"use client";

import { AlertMessage } from "@/components/AlertMessage";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
                message: "Invalid or missing reset token.",
                variant: "error",
            });
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setAlert({
                message: "Password must be at least 8 characters long.",
                variant: "error",
            });
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            setAlert({
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

            const data = await res.json();

            if (res.ok) {
                // setAlert({
                //     message: data.message || "Password reset successfully.",
                //     variant: "success",
                // });

                // setTimeout(() => {
                //     router.push("/login?reset=true");
                // }, 1500);
                router.push("/login?reset=true");
            } else {
                setAlert({
                    message: data.error || "Failed to reset password.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Reset password error:", error);
            setAlert({
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
                <div className="flex flex-col px-4 py-3 gap-4 rounded-lg border border-stone-700 dark:border-none
                    shadow-xl dark:shadow-none bg-[#b68945]/75 dark:bg-neutral-800/65">
                    <h1 className="text-2xl text-center font-semibold">
                        Reset your password
                    </h1>

                    <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                        Enter your new password below.
                    </p>
                </div>
                
                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
                    autoComplete="new-password"
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
                    autoComplete="new-password"
                />

                <div className="flex gap-4 h-[3.8rem]">
                    <button
                        type="submit"
                        disabled={resetLoading}
                        className="
                        h-full w-1/2 m-auto
                        border rounded-lg border-stone-700 dark:border-zinc-500
                        bg-[#c59854] dark:bg-neutral-600
                        text-[#111827] dark:text-zinc-300
                        focus:outline-2 focus:outline-[#867162] dark:focus:outline-2 dark:focus:outline-[#494951]
                        hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                        active:bg-[#ad803c] dark:active:bg-[#393939]
                        disabled:bg-[#c59854] disabled:dark:bg-neutral-600
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:cursor-pointer"
                    >
                        {resetLoading ? "Resetting..." : "Reset password"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="
                        w-1/2 py-2 m-auto
                        border rounded-lg border-stone-700 dark:border-zinc-500
                        bg-[#c59854] dark:bg-neutral-600
                        text-[#111827] dark:text-zinc-300
                        focus:outline-2 focus:outline-[#867162] dark:focus:outline-2 dark:focus:outline-[#494951]
                        hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                        active:bg-[#ad803c] dark:active:bg-[#393939]
                        hover:cursor-pointer"
                    >
                        Back to login
                    </button>
                </div>
            </form>

            {alert && (
                <AlertMessage
                    message={alert.message}
                    variant={alert.variant}
                    onDone={() => setAlert(null)}
                />
            )}
        </div>
    );
};

export default ResetPasswordClient;