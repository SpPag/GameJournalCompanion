import React from "react";
import { Game } from "@/types/Game";

interface GameTitleProps {
    game: Game;
}

const GameTitle: React.FC<GameTitleProps> = ({ game }: GameTitleProps) => {
    return (
        <div className="flex items-center justify-center gap-4 p-4 mx-auto relative top-10
        border border-2 rounded-xl border-zinc-500 dark:border-zinc-900
        w-fit
        text-2xl sm:text-3xl md:text-3xl lg:text-4xl
        shadow-xl dark:shadow-zinc-950/70
        text-zinc-950 dark:text-zinc-950
        dark:bg-white/10">
            <h1 className="italic pr-1">{game.title}</h1>
          </div>
    );
};

export { GameTitle };