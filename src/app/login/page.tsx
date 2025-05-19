"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const [email, setEmail] = useState(""); // tracks the email input
    const [password, setPassword] = useState(""); // tracks the password input
    const router = useRouter(); // used for navigating

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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
            <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)} // standard practice to update on every keystroke for validation (show error if the email isn't valid without having to submit the form. For example I may want to disable the submit button until the email is valid)
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
            <button type="submit" className="bg-blue-500 text-white py-2 rounded">
                Login
            </button>
        </form>
    );
}

export default LoginPage; // this needs to be default, because that's how Next.js knows to look for and import it