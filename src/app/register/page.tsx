'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertMessage } from "@/components/AlertMessage";

const RegisterPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<null | {
    id: number;
    message: string;
    variant: "error" | "success" | "warning" | "info";
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (res.ok) {
      setAlert({
        id: Date.now(),
        message: "Account created successfully!",
        variant: "success",
      });
      setTimeout(() => {
        router.push("/auth/checkEmail");
      }, 1500);// Redirect to check email page after registration
    } else {
      const isDev = process.env.NODE_ENV === "development";
      let message = "Registration failed.";

      if (isDev) {
        const data = await res.json().catch(() => null);
        message = data?.error || "Registration failed (server).";
      }
      setAlert({
        id: Date.now(),
        message,
        variant: "error",
      });
    }
  };

  const maxCharNum = 30; // Set a max character limit for the username input to prevent excessively long usernames that could cause issues in the UI or database. This is a common practice to ensure data integrity and a better user experience.

  return (
    <div className="dark:text-[#d4d4d8]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20" autoComplete="off">
        {/* Hidden dummy input to mislead autocomplete */}
        <input
          type="text"
          name="fakeusernameremembered"
          autoComplete="off"
          style={{ display: "none" }}
        />
        <input
          type="password"
          name="fakepasswordremembered"
          autoComplete="off"
          style={{ display: "none" }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
          autoComplete="off"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          maxLength={maxCharNum}
          required
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
          autoComplete="off"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
          autoComplete="new-password"
        />

        <div className="flex gap-4 h-[3.8rem]">
          <button type="submit" className="
          h-full w-1/2 m-auto
          border rounded-lg border-stone-700 dark:border-zinc-500
          bg-[#c59854] dark:bg-neutral-600
          text-2xl text-[#111827] dark:text-zinc-300
          focus:outline-2 focus:outline-[#867162] dark:focus:outline-2 dark:focus:outline-[#494951]
          hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
          active:bg-[#ad803c] dark:active:bg-[#393939]
          hover:cursor-pointer">
            Register
          </button>
          <button type="button" onClick={() => router.push("/login")} className="
          w-1/2 py-2 m-auto
          border rounded-lg border-stone-700 dark:border-zinc-500
          bg-[#c59854] dark:bg-neutral-600
          text-[#111827] dark:text-zinc-300
          focus:outline-2 focus:outline-[#867162] dark:focus:outline-2 dark:focus:outline-[#494951]
          hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
          active:bg-[#ad803c] dark:active:bg-[#393939]
          hover:cursor-pointer">
            <p className="text-center text-sm">
              Already have an account?
            </p>
            Login
          </button>
        </div>
        {alert && (
          <AlertMessage
            key={alert.id}
            message={alert.message}
            variant={alert.variant}
            onDone={() => setAlert(null)}
          />
        )}
      </form>
    </div>
  );
}

export default RegisterPage; // this needs to be default, because that's how Next.js knows to look for and import it