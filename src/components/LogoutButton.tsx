"use client";

import { signOut } from "next-auth/react";

const LogoutButton = () => {
    return (
    <button onClick={() => signOut({ callbackUrl: "/login"})} className="border px-4 py-2 rounded absolute top-0 right-0 mt-5 mr-10 bg-[#c59854] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#b68945] active:bg-[#ad803c] dark:bg-neutral-600 dark:hover:bg-[#4b4b4b] dark:focus:bg-[#4b4b4b] dark:active:bg-[#393939] dark:text-zinc-300 dark:focus:outline-2 dark:focus:outline-zinc-500">
        Logout
    </button>
    );
}

export { LogoutButton }