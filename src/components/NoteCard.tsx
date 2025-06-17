import { Note } from "@/types/Note";
import React from "react";
import Image from "next/image";

interface NoteCardProps {
    note?: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
    return (
        <div className={`relative text-center rounded-lg
                        text-xl
                        w-27 h-36 sm:w-30 sm:h-40 md:w-33 md:h-44 lg:w-36 lg:h-48
                        text-zinc-950 dark:text-zinc-950 cursor-pointer group overflow-hidden`}>
            {note ? (
                <>
                    {/* Image container */}
                    <div className="w-full h-full relative">
                        <Image
                            src="/NoteBackground_v1.jpg"
                            alt="Note Alt"
                            fill
                            className="object-cover"
                            priority={false}
                        />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                </>
            ) :
                <>
                    <div className="flex flex-col items-center bg-[url('/NoteBackground_v1_NoBackground.png')] bg-cover bg-center bg-no-repeat w-full h-full pt-8 px-4 text-lg">
                        <p className="block font-serif italic">Blank note</p>
                    </div>

                    {/* Hover overlay with plus sign */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="group-hover:scale-150 transition-transform duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="34"
                                height="34"
                                viewBox="0 0 512 512"
                                fill="none"
                                className="text-zinc-950"
                            >
                                <path
                                    d="M492.47 21.938c-82.74-.256-167.442 12.5-242.814 45.093 5.205 13.166 9.578 28.48 13.188 45.532C242.55 97.27 217.167 92.385 194.72 95.5c-46.22 28.432-87.13 66.305-119.44 115.594 25.193 7.756 51.57 22.81 72.845 43.844-31.87-7.045-68.907-5.895-99.188 3-13.743 28.688-25.008 60.48-33.343 95.687 128.71-30.668 130.522 3.514 50.75 140.438 16.877 12.614 42.182 13.77 61.906-1.563C134 267.936 231.43 326.246 254.188 354.562c14.288-40.59 34.77-82.54 62.906-126.468-17.29-14.667-39.21-24.838-63.813-32.375 25.364-5.256 50.91-10.928 74.126-11.22 6.482-.082 12.78.272 18.844 1.156 17.57-24.007 37.408-48.612 59.75-73.97-12.538-6.31-25.476-11.454-38.125-14.967 17.132-5.76 35.274-8.34 52.844-8.157 2.01.02 4.004.095 6 .187 20.07-21.708 41.927-43.976 65.75-66.813zM426.72 47.28c-130.93 65.394-226.626 162.926-281.784 286.25C172.34 184.41 287.048 84.57 426.72 47.28z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    </div>
                </>
            }
            {/* Note content */}
            {note &&
                <p className="whitespace-pre-wrap text-gray-800">{note.content}</p>
            }

        </div>
    )
};

export { NoteCard };