import { Game } from "@/types/Game";

interface GameCardProps {
    game?: Game;
}

const GameCard = ({ game }: GameCardProps) => {

    return (
        <div className="p-4 border border-2 rounded-xl border-zinc-500 text-2xl text-zinc-950 shadow-md dark:shadow-zinc-950/70 dark:border-zinc-900 dark:text-zinc-950 dark:bg-white/20">
            {game ? (
                <h2>GameCard</h2>
            ) :
                <div className="flex flex-col gap-4 items-center">
                    <div>GameCard</div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
            }

        </div>
    )
}

export { GameCard }