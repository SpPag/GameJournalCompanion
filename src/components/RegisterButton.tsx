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
                    className={`z-50 border px-4 py-2 rounded absolute top-0 right-22 mt-5 mr-5 bg-[#c59854] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#b68945] active:bg-[#ad803c] dark:bg-neutral-600 dark:hover:bg-[#4b4b4b] dark:focus:bg-[#4b4b4b] dark:active:bg-[#393939] dark:text-zinc-300 dark:focus:outline-2 dark:focus:outline-zinc-500`}
                >
                    Register
                </button>
            )}
        </>
    );
}

export { RegisterButton }