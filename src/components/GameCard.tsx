import { Game } from "@/types/Game";
import React from "react";
import Image from "next/image";

interface GameCardProps {
    game?: Game;
}

const GameCard = ({ game }: GameCardProps) => {

    const borderClasses = game ? "border-none" : "border border-2"

    return (
        <div className={`relative text-center ${borderClasses} rounded-lg text-xl w-27 h-36 sm:w-30 sm:h-40 md:w-33 md:h-44 lg:w-36 lg:h-48
        border-zinc-500 bg-cover bg-center bg-no-repeat text-zinc-950 shadow-md dark:shadow-zinc-950/70 dark:border-zinc-900 dark:text-zinc-950 dark:bg-[#c5c7cb]/20 cursor-pointer group overflow-hidden`}>
            {game ? (
                <>
                    {/* Image container */}
                    <div className="w-full h-full relative">
                        <Image
                            src={game.cover || "/GameCardBackground_final_v4.png"}
                            alt={game.title}
                            fill
                            className="object-cover"
                            priority={false}
                        />
                    </div>

                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <p className="text-white text-center text-sm px-2">{game.title}</p>
                    </div>
                </>
            ) :
                <>
                    <div className="flex flex-col items-center bg-[url('/GameCardBackground_final_v4.png')] bg-cover bg-center bg-no-repeat w-full h-full">
                        <div className="block">Register a new game</div>
                    </div>

                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                            <g id="SVGRepo_iconCarrier">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" fill="#292929"/>
                            </g>
                        </svg>
                    </div>
                </>
            }
        </div>
    )
}

export { GameCard }