import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { clientPromise } from "@/../lib/mongodb";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";


const authOptions: NextAuthOptions = {
    // Adapter stores sessions/users in MongoDB
    adapter: MongoDBAdapter(clientPromise),
    // Enable credentials (email + password)
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 1. Connect to DB
                await dbConnect();

                // 2. Find user by email
                const user = await User.findOne({ email: credentials?.email });
                if (!user) throw new Error("No user found with this email");

                // 3. Check password
                const isValid = await bcrypt.compare(credentials!.password, user.password);
                if (!isValid) throw new Error("Invalid password");

                // 4. Return user object (required!)
                return {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    isAdmin: user.isAdmin
                };
            }
        })
    ],

    // You’ll need a secret for signing JWTs and sessions
    secret: process.env.NEXTAUTH_SECRET,

    // Enable session strategy (JWT is recommended)
    session: {
        strategy: "jwt",
    },

    // Optional: callbacks to control session data
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username ?? ""; // since username is optional I'm setting a default value. Alternatively, I could only assign username if it exists, but then I'd have to go to the JWT interface in nextAuth.d.ts and set the username field as optional there as well
                token.isAdmin = user.isAdmin ?? false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.isAdmin = token.isAdmin;
            }
            return session;
        },
    },

    pages: {
        signIn: '/login', // use your custom login page
    },
};

const handler = NextAuth(authOptions);

export {authOptions, handler as GET, handler as POST };