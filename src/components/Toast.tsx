"use client";

import { set } from "mongoose";
import { useEffect } from "react";
import React from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDone: () => void;
  duration?: number; // milliseconds
}

const Toast = ({ message, type = "success", onDone, duration = 4000 }: ToastProps) => {

  const [visible, setVisible] = React.useState(false);

  // Automatically dismiss after `duration`
  useEffect(() => {
    // Defer visibility toggle by one tick
    const show = setTimeout(() => setVisible(true), 10);

    // Start fade-out shortly before the Toast is removed
    const fadeOutTime = duration - 1000; // match `duration-1000` transition
    const fadeOutTimer = setTimeout(() => setVisible(false), fadeOutTime);
    const removeTimer = setTimeout(onDone, duration);
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [onDone, duration]);

  const bgColor = type === "success" ? "bg-[#19662f]/75 dark:bg-[#143e1e]/60" : "bg-[#882d23] dark:bg-[#741911]/60";

  return (
    <div
      className={`z-50 fixed bottom-6 right-6 ${bgColor} px-4 py-2 rounded shadow-lg text-[#111827] dark:text-zinc-300 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {message}
    </div>
  );
};

export { Toast };