import { useSession } from "next-auth/react";
import React from "react";

const WelcomeUser = () => {

    const { data: session, status } = useSession();

    // checking for status == loading to avoid flickering the div before the session data is available
    if (status === "loading") return null;

    return (
        <>
            {session &&
                <div className="border border-2 rounded-xl z-10 px-4 py-2 text-base sm:text-xl border-zinc-500 shadow-xl text-zinc-950 dark:shadow-zinc-950/70 dark:border-zinc-900 dark:text-zinc-950 dark:bg-white/10 m-auto w-fit">
                    Welcome {session.user.username}
                </div>
            }
        </>
    )
};

export { WelcomeUser };