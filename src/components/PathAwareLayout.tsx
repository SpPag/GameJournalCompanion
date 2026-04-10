'use client';

import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';
import { RegisterButton } from './RegisterButton';
import { DeleteAccountButton } from './DeleteAccountButton';
import React from 'react';

interface PathAwareLayoutProps {
    children: React.ReactNode;
}

export default function PathAwareLayout({ children }: PathAwareLayoutProps) {
    const pathname = usePathname();

    // hide auth-related buttons on login and register pages
    const showAuthButtons = pathname !== '/login' && pathname !== '/register';

    return (
        <>
            {showAuthButtons &&
                <>
                    <AuthButton />
                    <RegisterButton />
                    <DeleteAccountButton />
                </>
            }
            {children}
        </>
    );
}