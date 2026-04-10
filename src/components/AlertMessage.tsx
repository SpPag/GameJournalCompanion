'use client';

import React from "react";
import { useEffect, useState, ReactNode } from "react";

type Variant = "error" | "success" | "warning" | "info"; // I currently only use 'error' but I'm adding these here in case they're useful in the future. Expand freely

interface AlertMessageProps {
    message: ReactNode;
    variant: Variant;
    onDone: () => void;
    duration?: number;
}

const AlertMessage = ({ message, variant, onDone, duration = 4000 }: AlertMessageProps) => {

    const [visible, setVisible] = React.useState(true);

    // Automatically dismiss after `duration`
    useEffect(() => {
        // Defer visibility toggle by one tick
        const show = setTimeout(() => setVisible(true), 10);

        // Start fade-out shortly before the Toast is removed
        const fadeOutTime = duration - 1000; // match `duration-1000` transition
        const fadeOutTimer = setTimeout(() => setVisible(false), fadeOutTime);
        const removeTimer = setTimeout(onDone, duration);

        return () => {
            clearTimeout(show);
            clearTimeout(fadeOutTimer);
            clearTimeout(removeTimer);
        };
    }, [duration, onDone]);

    const bgColors: Record<string, string> = {  // I currently only use 'error' but I'm adding these here in case they're useful in the future. Expand freely
        error: "bg-[#a33226] dark:bg-[#741911]/60",
        success: "bg-[#19662f]/75 dark:bg-[#143e1e]/60",
        warning: "bg-yellow-500 dark:bg-yellow-700",
        info: "bg-blue-500 dark:bg-blue-700",
    };

    const bgColor = bgColors[variant] ?? "bg-gray-500 dark:bg-gray-700"; // fallback

    return (
        <div
            className={`z-50 relative w-fit top-6 mx-auto ${bgColor} px-4 py-2 rounded shadow-lg text-[#111827] dark:text-zinc-300 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {message}
        </div>
    );
}

export { AlertMessage };