// app/components/AdminPanel.tsx
'use client';

import { useState } from "react";
import { AdminButton } from "./AdminButton";
import { AdminModal } from "./AdminModal";
import { AddGameForm } from "./AddGameForm";
import React from "react";

const AdminPanel = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <AdminButton onClick={() => setIsModalOpen(true)} />
            {isModalOpen &&
                <AdminModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <AddGameForm onSuccess={() => setIsModalOpen(false)}/>
                </AdminModal>
            }
        </>
    );
};

export { AdminPanel };