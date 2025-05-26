'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import React from 'react';

interface SessionWrapperProps {
  children: ReactNode
}
const SessionWrapper = ({ children }: SessionWrapperProps) => {
  return <SessionProvider>{children}</SessionProvider>;
}

export { SessionWrapper };