"use client";

import { useEffect } from "react";
import React from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDone: () => void;
  duration?: number; // milliseconds
}

const Toast = ({ message, type = "success", onDone, duration = 4000 }: ToastProps) => {
  // Automatically dismiss after `duration`
  useEffect(() => {
    const id = setTimeout(onDone, duration);
    return () => clearTimeout(id);
  }, [onDone, duration]);

  const bgColor = type === "success" ? "bg-[#19662f]/75 dark:bg-[#143e1e]/60" : "bg-[#882d23] dark:bg-[#741911]/60";

  return (
    <div 
      className={`z-50 fixed bottom-6 right-6 ${bgColor} px-4 py-2 rounded shadow-lg text-[#111827] dark:text-zinc-300`}
    >
      {message}
    </div>
  );
};

export { Toast };