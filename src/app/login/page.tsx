"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";

const LoginPage = () => {
    const [email, setEmail] = useState(""); // tracks the email input
    const [password, setPassword] = useState(""); // tracks the password input
    const router = useRouter(); // used for navigating
    const { status } = useSession(); // get session data to check if the user is already logged in

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/"); // or dashboard page
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // send login request
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        // check if login was successful
        if (res?.ok) {
            router.push("/"); // redirect to home
        } else {
            alert("Invalid login");
        }
    }

    // Show loading state until session status is determined
    if (status !== "unauthenticated") {
        return (
            <div className="flex justify-center items-center text-zinc-950">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="dark:text-[#d4d4d8]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20 center ">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)} // standard practice to update on every keystroke for validation (show error if the email isn't valid without having to submit the form. For example I may want to disable the submit button until the email is valid)
                    className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded bg-[#f5f5f4] text-[#111827] border-stone-700 focus:outline-2 focus:outline-[#836e5e]/70 dark:text-[#d4d4d8] dark:border-zinc-500 dark:bg-[#312d29] dark:focus:outline-2 dark:focus:outline-zinc-400"
                />
                <div className="flex gap-4 h-[3.8rem]">
                    <button type="submit" className="
                    h-full w-1/2 m-auto
                    border rounded-lg border-stone-700 dark:border-zinc-500
                    bg-[#c59854] dark:bg-neutral-600
                    text-2xl text-[#111827] dark:text-zinc-300
                    focus:outline-2 focus:outline-[#867162] dark:focus:bg-[#4b4b4b] dark:focus:outline-2 dark:focus:outline-zinc-500
                    hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                    active:bg-[#ad803c] dark:active:bg-[#393939]">
                        Login
                    </button>
                    <button type="button" onClick={() => router.push("/register")} className="
                    w-1/2 py-2 m-auto
                    border rounded-lg border-stone-700 dark:border-zinc-500
                    bg-[#c59854] dark:bg-neutral-600
                    text-[#111827] dark:text-zinc-300
                    focus:outline-2 focus:outline-[#867162] dark:focus:bg-[#4b4b4b] dark:focus:outline-2 dark:focus:outline-zinc-500
                    hover:bg-[#b68945] dark:hover:bg-[#4b4b4b]
                    active:bg-[#ad803c] dark:active:bg-[#393939]">
                        <p className="text-center text-sm">
                            Don&apos;t have an account?
                        </p>
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginPage; // this needs to be default, because that's how Next.js knows to look for and import it