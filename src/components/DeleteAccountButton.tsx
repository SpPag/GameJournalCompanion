"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { AlertMessage } from "@/components/AlertMessage";

const DeleteAccountButton = () => {
    const { data: session, status } = useSession();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [alert, setAlert] = useState<null | {
        id: number;
        message: string;
        variant: "error" | "success" | "warning" | "info";
    }>(null);

    if (status === "loading") return null;
    if (!session) return null;

    const handleDeleteClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            const res = await fetch("/api/account/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                setIsConfirmModalOpen(false);
                await signOut({ callbackUrl: "/?accountDeleted=true" });
            } else {
                const isDev = process.env.NODE_ENV === "development";
                let message = "Failed to delete account.";

                if (isDev) {
                    const data = await res.json().catch(() => null);
                    message = data?.error || "Failed to delete account (server).";
                }
                setIsConfirmModalOpen(false);
                setAlert({
                    id: Date.now(),
                    message,
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setIsConfirmModalOpen(false);
            setAlert({
                id: Date.now(),
                message: "Something went wrong while deleting your account.",
                variant: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {alert && (
                <AlertMessage
                    key={alert.id}
                    message={alert.message}
                    variant={alert.variant}
                    onDone={() => setAlert(null)}
                />
            )}
            <button
                type="button"
                className="fixed bottom-6 right-6 z-50
                px-4 py-2
                border rounded-lg
                border-stone-700
                text-[0.95rem]/[1.25rem] md:text-[0.97rem]/[1.3rem] lg:text-base
                text-[#111827] dark:text-zinc-300
                bg-[#d64d0c] dark:bg-[#441901]
                focus:outline-2 focus:outline-[#cc3600] dark:focus:outline-zinc-700
                hover:bg-[#be3300] dark:hover:bg-[#612905] hover:cursor-pointer
                active:bg-[#cc470c] dark:active:bg-[#542204]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#d64d0c] dark:disabled:hover:bg-[#441901]"
                onClick={handleDeleteClick}
                disabled={isDeleting}
            >
                {isDeleting ? "Deleting..." : "Delete my account"}
            </button>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Deleting Account"
                message="Are you sure you want to delete your account? All associated notes will also be deleted. This action cannot be undone."
                onConfirm={handleConfirmDeleteAccount}
                onClose={() => {
                    if (!isDeleting) {
                        setIsConfirmModalOpen(false);
                    }
                }}
                confirmText="Delete account"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </>
    );
};

export { DeleteAccountButton };