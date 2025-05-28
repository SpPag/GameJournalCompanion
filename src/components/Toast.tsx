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

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div 
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-4 py-2 rounded shadow-lg`}
    >
      {message}
    </div>
  );
};

export { Toast };