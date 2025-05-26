import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import React from "react";
import { SessionWrapper } from "@/components/SessionWrapper";
import PathAwareLayout from "@/components/PathAwareLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Journal Companion",
  description: "Scribble down all your notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Wrapping everything in the a session provider to be able to track user authentication and session. The wrapping everything in the dark mode provider that handles changing background image based on light - dark mode */}
        <SessionWrapper>
          <DarkModeProvider>
            {/* <main className="flex-1">{children}</main>
            <footer className="text-center text-zinc-500 dark:text-zinc-400">
              <p>{"\u00A9"} {new Date().getFullYear()} - Game Journal Companion</p>
            </footer> */}
            <PathAwareLayout>
              <main className="flex-1">{children}</main>
              <footer className="max-w-fit mx-auto mb-2 flex gap-[24px] flex-wrap items-center justify-center text-sm text-zinc-950 dark:text-zinc-950 dark:backdrop-blur-xs">
                <p>{"\u00A9"} {new Date().getFullYear()} - Game Journal Companion</p>
              </footer>
            </PathAwareLayout>
          </DarkModeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
