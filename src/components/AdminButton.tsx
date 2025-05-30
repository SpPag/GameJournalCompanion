'use client';

import { useSession } from "next-auth/react";
import React from "react";

interface AdminButtonProps {
    onClick: () => void;
}

const AdminButton = ({ onClick }: AdminButtonProps) => {
    // extracting the session data into a variable I'm naming session and the session status into a variable I'm naming status
    const { data: session, status } = useSession();

    // Interesting ChatGPT suggestion: you can show a loading state while checking auth
    if (status !== "authenticated" || !session.user.isAdmin) return null;

    return (
        <button onClick={onClick}
            className={`z-50 border px-4 py-2 rounded absolute top-1 left-14 mt-5 ml-5 bg-[#c59854] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#b68945] active:bg-[#ad803c] dark:bg-neutral-600 dark:hover:bg-[#4b4b4b] dark:focus:bg-[#4b4b4b] dark:active:bg-[#393939] dark:text-zinc-300 dark:focus:outline-2 dark:focus:outline-zinc-500
            `}
        >
            Add Game To Database
        </button>
    )
}

export { AdminButton }