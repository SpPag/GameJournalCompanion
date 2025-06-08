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

const variantClasses: Record<Variant, string> = {
    error: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
    // I currently only use 'error' but I'm adding these here in case they're useful in the future. Expand freely, examples:
    success: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
    info: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
};

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
        error: "bg-[#882d23] dark:bg-[#741911]/60",
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