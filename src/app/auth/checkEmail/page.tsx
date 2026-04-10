"use client";

import { AlertMessage } from "@/components/AlertMessage";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


const CheckEmailPage = () => {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [alert, setAlert] = useState<null | {
        message: string;
        variant: "error" | "success" | "warning" | "info";
    }>(null);

    const COOLDOWN_KEY = "resend_email_cooldown_until";

    useEffect(() => {
        const saved = localStorage.getItem(COOLDOWN_KEY);

        if (!saved) return;

        const cooldownUntil = parseInt(saved, 10);
        const now = Date.now();

        if (cooldownUntil > now) {
            setCooldown(Math.ceil((cooldownUntil - now) / 1000));
        }
    }, []);

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

    return (
        <div className="flex flex-col items-center justify-center mt-20 text-center gap-4">
            <h1 className="text-2xl font-bold">Check your email 📩</h1>

            <p className="text-zinc-600 dark:text-zinc-300 max-w-md">
                We sent you a verification link. Click it to activate your account.
                If you don&apos;t see it, check spam or request a new one.
            </p>

            <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded bg-[#c59854] text-white"
            >
                Go to login
            </button>

            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded"
            />

            <button
                disabled={loading || cooldown > 0}
                className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50"
                onClick={async () => {
                    if (cooldown > 0) return;

                    setLoading(true);

                    const res = await fetch("/api/auth/resendVerificationEmail", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    });

                    setLoading(false);

                    if (res.ok) {
                        setAlert({
                            message: "Verification email sent!",
                            variant: "success",
                        });
                        const cooldownUntil = Date.now() + 60 * 1000;

                        localStorage.setItem(COOLDOWN_KEY, cooldownUntil.toString());
                        setCooldown(60);
                    } else {
                        setAlert({
                            message: "Failed to resend email",
                            variant: "error",
                        });
                    }
                }}
            >
                {cooldown > 0
                    ? `Resend email (${cooldown}s)`
                    : "Resend email"}
            </button>
            {alert && (
                <AlertMessage
                    message={alert.message}
                    variant={alert.variant}
                    onDone={() => setAlert(null)}
                />
            )}
        </div>
    );
}

export default CheckEmailPage;