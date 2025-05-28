// app/components/AdminPanel.tsx
'use client';

import { useState } from "react";
import { AdminButton } from "./AdminButton";
import { AdminModal } from "./AdminModal";
import { AddGameForm } from "./AddGameForm";
import { Toast } from "./Toast";
import React from "react";

const AdminPanel = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<null | { message: string; type: "success" | "error" }>(null);

    // Called by the form on success
    const handleSuccess = () => {
        setIsModalOpen(false);
        setToast({ message: "Game added successfully!", type: "success" });
    };

    // Called by the form on error
    const handleError = () => {
        setToast({ message: "Failed to add game.", type: "error" });
    };

    return (
        <>
            <AdminButton onClick={() => setIsModalOpen(true)} />

            {isModalOpen &&
                <AdminModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <AddGameForm onSuccess={handleSuccess} onError={handleError} />
                </AdminModal>
            }

            {toast && (
                <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
            )}
        </>
    );
};

export { AdminPanel };