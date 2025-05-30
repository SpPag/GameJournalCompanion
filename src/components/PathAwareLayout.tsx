'use client';

import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';
import { RegisterButton } from './RegisterButton';
import React from 'react';

interface PathAwareLayoutProps {
    children: React.ReactNode;
}

export default function PathAwareLayout({ children }: PathAwareLayoutProps) {
    const pathname = usePathname();

    // hide AuthButton on login and register pages
    const showAuthButtons = pathname !== '/login' && pathname !== '/register';

    return (
        <>
            {showAuthButtons &&
                <>
                    <AuthButton />
                    <RegisterButton />
                </>
            }
            {children}
        </>
    );
}