import { Game } from "@/types/Game";
import React from "react";

interface GameCardProps {
    game?: Game;
}

const GameCard = ({ game }: GameCardProps) => {

    return (
        <div className="text-center p-4 border border-2 rounded-xl text-xl w-24 h-38 sm:w-26 sm:h-41 md:w-28 md:h-44 lg:w-34 lg:h-52 border-zinc-500 bg-[url(/GameCardBackgroundCroppedNoBackground_v3.png)] bg-cover bg-no-repeat text-zinc-950 shadow-md dark:shadow-zinc-950/70 dark:border-zinc-900 dark:text-zinc-950 dark:bg-gray-300/20">
            {game ? (
                <h2>GameCard</h2>
            ) :
                <div className="flex flex-col gap-4 items-center">
                    <div className="block">Register a new game</div>
                </div>
            }
        </div>
    )
}

export { GameCard }