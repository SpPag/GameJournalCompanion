import { useSession } from "next-auth/react";
import React from "react";

const AboutMessage = () => {

    const { data: session, status } = useSession();

    // checking for status == loading to avoid flickering the div before the session data is available
    if (status === "loading") return null;

    const messageTitle = "Welcome to the Game Journal Companion";

    const messageOption1 = "Game Journal Companion is your digital notebook for gaming.\nTrack which games you're playing, and write down anything you want to remember — like shops with rare items, tough fights, or puzzles you'll come back to later.";

    const messageOption2 = "Ever paused your game to jot something down — like a vendor with a lucrative deal, a chest you couldn't open yet, or a strategy for the Battle Tree in Pokemon?\n\nThis app is made for that.\n\nRegister the games you're playing and keep track of anything worth returning to.";

    return (
        <>
            {!session && (
                <div className="
                    flex flex-col items-center justify-evenly z-50 px-4 pt-2 mt-10
                    w-130 h-60 md:w-140 md:h-60 lg:w-160 lg:h-70
                    font-merienda
                    border border-stone-700 dark:border-none rounded-lg
                    shadow-xl dark:shadow-none
                    text-[#111827] dark:text-zinc-300
                    bg-[#b68945]/75 dark:bg-neutral-800/65">
                    <div className="
                        mb-3
                        text-base md:text-base lg:text-xl
                        font-[800]
                        ">{messageTitle}</div>
                    <div className="
                        text-[0.85rem]/[1.1rem] sm:text-[0.9rem]/[1.2rem] md:text-[0.97rem]/[1.3rem] lg:text-[1rem]/6
                        tracking-wider
                        whitespace-pre-line
                        text-center
                        ">{messageOption2}</div>
                </div>
            )}
        </>
    );
}

export { AboutMessage }