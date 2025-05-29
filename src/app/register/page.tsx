"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/login"); // Redirect to login after successful registration
    } else {
      setError(data.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Register</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        required
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" className="border py-2 rounded w-1/2 m-auto bg-[#c59854] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#867162] hover:bg-[#b68945] active:bg-[#ad803c] dark:bg-neutral-600 dark:hover:bg-[#4b4b4b] dark:focus:bg-[#4b4b4b] dark:active:bg-[#393939] dark:text-zinc-300 dark:focus:outline-2 dark:focus:outline-zinc-500">
        Register
      </button>
    </form>
  );
}
