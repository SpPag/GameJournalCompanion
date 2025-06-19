"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const RegisterButton = () => {

    // extracting the session data into a variable I'm naming session and the session status into a variable I'm naming status
    const { status } = useSession();
    const router = useRouter();

    if (status === "loading") return null; // Don't render anything until we know the auth status

    return (
        <>
            {status === "unauthenticated" && (
                <button
                    onClick={() => router.push("/register")}
                    className="
                    flex items-center z-50 px-4 py-2
                    mt-5 mr-2 sm:mr-3 md:mr-4 lg:mr-5
                    absolute top-0 right-22 mt-5 mr-2 sm:mr-3 md:mr-4 lg:mr-5
                    border rounded-lg border-stone-700 dark:border-neutral-600
                    text-[0.95rem]/[1.25rem] md:text-[0.97rem]/[1.3rem] lg:text-base
                    text-[#111827] dark:text-zinc-300
                    bg-[#c59854] dark:bg-neutral-800
                    focus:bg-[#a37732] focus:outline-2 focus:outline-[#867162] dark:focus:bg-[#4b4b4b] dark:focus:outline-2 dark:focus:outline-zinc-500
                    hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                    active:bg-[#ad803c] dark:active:bg-[#393939]"
                >
                    Register
                </button>
            )}
        </>
    );
}

export { RegisterButton }