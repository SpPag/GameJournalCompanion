import { Note } from "@/types/Note";
import React from "react";
import Image from "next/image";

interface NoteCardProps {
    note?: Note;
    onEdit?: () => void;
    onDelete?: () => void;
}

const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
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
                            src="/NoteBackground_v1_NoBackground.png"
                            alt="Note Alt"
                            fill
                            className="object-cover"
                            priority={false}
                        />
                    </div>

                    {/* Delete button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer z-10"
                    >
                        <svg
                            className="h-8 w-8 text-gray-600 hover:text-gray-800" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <line x1="4" y1="7" x2="20" y2="7" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                    </button>

                    {/* Edit button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className="absolute top-2 right-10 text-gray-600 hover:text-gray-800 cursor-pointer z-10"
                    >
                        <svg
                            className="h-8 w-8" viewBox="0 0 497.616 497.616"
                        >
                            <g id="XMLID_116_">
                                <path id="XMLID_118_" d="M470.314,392.915l-40.059-0.264c-0.043,0-0.083,0-0.117,0c-9.308,0-16.885,7.512-16.944,16.828
                                c-0.058,9.365,7.473,16.993,16.829,17.06l18.814,0.123c-5.874,10.357-16.995,17.357-29.727,17.383h-0.141
                                c-18.814-0.049-34.112-15.356-34.112-34.186V284.557c-10.441,8.107-21.918,16.232-33.888,23.258v102.044
                                c0,12.51,3.631,24.101,9.546,34.186H179.634c-23.969,0-43.461-19.492-43.461-43.46V87.755c0-12.508-3.631-24.1-9.548-34.185
                                h180.883c23.969,0,43.462,19.493,43.462,43.46v13.478c10.556-8.033,21.634-15.694,32.927-22.992
                                c-4.756-38.133-36.999-67.834-76.389-67.834c0,0-239.881,0.049-239.964,0.049C30.255,20.03,0,50.409,0,87.755
                                c0,9.317,7.519,16.886,16.829,16.944l40.059,0.266c0.042,0,0.083,0,0.117,0c9.308,0,16.885-7.513,16.944-16.829
                                c0.058-9.365-7.473-16.993-16.829-17.059l-18.815-0.125C44.18,60.594,55.3,53.594,68.032,53.57h0.141
                                c18.814,0.049,34.112,15.355,34.112,34.185v312.83c0,42.649,34.7,77.349,77.35,77.349c0,0,239.881-0.049,239.964-0.049
                                c37.288-0.299,67.544-30.68,67.544-68.026C487.143,400.544,479.621,392.972,470.314,392.915z" fill="currentColor"/>
                                <path id="XMLID_117_" d="M495.291,70.348c-1.521-1.521-3.548-2.316-5.6-2.316c-1.183,0-2.382,0.264-3.492,0.81
                                c-34.293,16.846-104.104,53.803-143.586,93.292c-43.767,43.758-71.74,89.8-71.565,114.497l-26.989,26.988l-34.235,34.235
                                l41.93-5.989l10.358-10.358l26.923-26.922c0.074,0,0.132,0.032,0.206,0.032c24.738,0,70.64-27.957,114.266-71.583
                                c14.163-14.163,27.962-32.273,40.664-51.204l-9.201-9.2l15.199-0.009c3.433-5.32,6.791-10.615,10.011-15.926l-17.226-5.039
                                l25.631-9.233c11.781-20.468,21.593-39.49,28.22-52.984C498.304,76.396,497.684,72.739,495.291,70.348z" fill="currentColor"/>
                            </g>
                        </svg>
                    </button>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                    
                    {/* Note title */}
                    <div className="absolute inset-0 flex flex-col items-center pt-8 px-4 text-lg pointer-events-none">
                        <p className="block font-serif italic text-gray-800 break-words text-center line-clamp-3">{note.title}</p>
                    </div>
                </>
            ) :
                <>
                    <div className="flex flex-col items-center bg-[url('/NoteBackground_v1_NoBackground.png')] bg-cover bg-center bg-no-repeat w-full h-full pt-8 px-4 text-lg">
                        <p className="block font-serif italic">Blank note</p>
                    </div>

                    {/* Hover overlay with quill icon */}
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
        </div>
    )
};

export { NoteCard };