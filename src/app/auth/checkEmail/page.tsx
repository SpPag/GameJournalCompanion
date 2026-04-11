"use client";

import { AlertMessage } from "@/components/AlertMessage";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const CheckEmailPage = () => {
    const router = useRouter();

    // Get the currently logged-in user's session
    const { status } = useSession();

    // State for user input, resend request loading state, session loading state, cooldown timer and alert messages
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [alert, setAlert] = useState<null | {
        message: string;
        variant: "error" | "success" | "warning" | "info";
    }>(null);
    const handleAlertDone = useCallback(() => {
        setAlert(null);
    }, []);

    // Key used to persist cooldown in localStorage
    //      allows cooldown to survive page refreshes
    const COOLDOWN_KEY = "resend_email_cooldown_until";

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

    // On mount:
    // Check if a cooldown is already stored in localStorage and restore it if still valid
    useEffect(() => {
        const saved = localStorage.getItem(COOLDOWN_KEY);

        if (!saved) return;

        const cooldownUntil = parseInt(saved, 10);
        const now = Date.now();

        // If cooldown hasn't expired, restore remaining time
        if (cooldownUntil > now) {
            setCooldown(Math.ceil((cooldownUntil - now) / 1000));
        }
    }, []);

    // On mount:
    // Countdown effect:
    //      - Decreases cooldown every second
    //      - Removes localStorage entry when cooldown reaches 0
    useEffect(() => {
        if (cooldown <= 0) return;

        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    localStorage.removeItem(COOLDOWN_KEY);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    // 7. Handle resend form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Prevent accidental calls during cooldown
        if (cooldown > 0) return;

        setResendLoading(true);

        const isDev = process.env.NODE_ENV === "development";

        try {
            const res = await fetch("/api/auth/resendVerificationEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setAlert({
                    message: "Verification email sent!",
                    variant: "success",
                });

                // Start cooldown (2 minutes)
                const cooldownUntil = Date.now() + 120 * 1000;

                // Persist cooldown so it survives refresh
                localStorage.setItem(COOLDOWN_KEY, cooldownUntil.toString());
                setCooldown(120);
            } else {
                let message = "Failed to resend email";
                if (isDev) {
                    const data = await res.json().catch(() => null);
                    message = data?.error || "Failed to resend email (server)";
                }

                setAlert({
                    message,
                    variant: "error",
                });
            }
        } catch (error) {
            setAlert({
                message: isDev
                    ? "Failed to resend email (network error)"
                    : "Something went wrong. Please try again.",
                variant: "error",
            });
        } finally {
            setResendLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 text-center gap-4">
                <div className="text-center text-xl text-zinc-900 dark:text-zinc-300">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center mt-20 text-center gap-4">
            <h1 className="text-2xl font-bold">Check your email!</h1>

            <p className="text-zinc-600 dark:text-zinc-300 max-w-md">
                We sent you a verification link. Click it to activate your account.
                If you don&apos;t see it, check spam or request a new one.
            </p>

            {/* 8. Navigate user to login page */}
            <button
                onClick={() => router.replace("/login")}
                className="px-4 py-2 rounded bg-[#c59854] text-white hover:cursor-pointer"
            >
                Go to login
            </button>

            {/* 9. Resend email form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 rounded"
                />

                <button
                    type="submit"
                    disabled={resendLoading || cooldown > 0}
                    className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50 hover:cursor-pointer"
                >
                    {cooldown > 0
                        ? `Resend email (${cooldown}s)`
                        : resendLoading
                            ? "Sending..."
                            : "Resend email"}
                </button>
            </form>

            {/* 10. Alert message display */}
            {alert && (
                <AlertMessage
                    message={alert.message}
                    variant={alert.variant}
                    onDone={handleAlertDone}
                />
            )}
        </div>
    );
};

export default CheckEmailPage;