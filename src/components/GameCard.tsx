import { Game } from "@/types/Game";
import React from "react";

interface GameCardProps {
    game?: Game;
}

const GameCard = ({ game }: GameCardProps) => {

    return (
        <div className="relative text-center border border-2 rounded-lg text-xl w-24 h-38 sm:w-26 sm:h-41 md:w-28 md:h-44 lg:w-34 lg:h-52 border-zinc-500 bg-cover bg-center bg-no-repeat text-zinc-950 shadow-md dark:shadow-zinc-950/70 dark:border-zinc-900 dark:text-zinc-950 dark:bg-gray-300/20 cursor-pointer group overflow-hidden"
        >
            {game ? (
                <>
                    {/* Image container */}
                    <div className="w-full h-full">
                        <img
                            src={game.cover || "/GameCardBackgroundCroppedNoBackground_v3.png"}
                            alt={game.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>

                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <p className="text-white text-center text-sm px-2">{game.title}</p>
                    </div>
                </>
            ) :
                <div className="flex flex-col items-center bg-[url('/GameCardBackgroundCroppedNoBackground_v3.png')] bg-cover bg-center bg-no-repeat w-full h-full">
                    <div className="block">Register a new game</div>
                </div>
            }
        </div>
    )
}

export { GameCard }