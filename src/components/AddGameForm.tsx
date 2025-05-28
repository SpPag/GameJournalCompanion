"use client";

import { useState } from "react";
import React from "react";

interface GameFormData {
  title: string;
  publisher: string;
  developer: string;
  westernReleaseYear: string;
  cover: string;
  genres: string;
}

const AddGameForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState<GameFormData>({
    title: "",
    publisher: "",
    developer: "",
    westernReleaseYear: "",
    cover: "",
    genres: "",
  });

  // status can only be ""|"submitting"|"error"|"success"
  const [status, setStatus] = useState<"" | "submitting" | "error" | "success">("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(form => ({ ...form, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/games/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
      onSuccess();
      setForm({ title: "", publisher: "", developer: "", westernReleaseYear: "", cover: "", genres: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Add New Game</h2>

      {(["title", "publisher", "developer", "westernReleaseYear", "cover", "genres"] as const).map(name => (
        <input
          key={name}
          name={name}
          type={name === "westernReleaseYear" ? "number" : "text"}
          placeholder={name === "westernReleaseYear" ? "Release Year" : name.charAt(0).toUpperCase() + name.slice(1)}
          value={form[name]}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 bg-transparent"
          {...(name === "westernReleaseYear" && {
            min: 1950,
            max: new Date().getFullYear(),
            step: 1,
          })}
        />
      ))}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {status === "submitting" ? "Saving…" : "Save Game"}
      </button>
      {status === "error" && <p className="text-red-500">Failed to save.</p>}
    </form>
  );
}

export { AddGameForm };