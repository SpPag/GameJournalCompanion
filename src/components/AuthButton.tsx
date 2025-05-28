"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const AuthButton = () => {

    // extracting the session data into a variable I'm naming session and the session status into a variable I'm naming status
    const { data: session, status } = useSession();
    const router = useRouter();

    // Interesting ChatGPT suggestion: you can show a loading state while checking auth
    if (status === "loading") return null;

    return (
        <button
            onClick={() => session ? signOut() : router.push("/login")} // can add '{ callbackUrl: "/login" }' as the callback URL in signOut(), to redirect to the login page upon logout
            className={`border px-4 py-2 rounded absolute top-0 right-0 mt-5 mr-5 bg-[#c59854] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#b68945] active:bg-[#ad803c] dark:bg-neutral-600 dark:hover:bg-[#4b4b4b] dark:focus:bg-[#4b4b4b] dark:active:bg-[#393939] dark:text-zinc-300 dark:focus:outline-2 dark:focus:outline-zinc-500
            `}
        >
            {session ?
                (
                    <>
                        Logged in as {session.user.username}<br/>Logout
                    </>
                ) :
                "Login"
            }
        </button>
    );
}

export { AuthButton }