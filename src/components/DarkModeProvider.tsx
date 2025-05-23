// components/DarkModeProvider.jsx
'use client'; // Required if using Next.js 13+ App Router

import { ReactNode, useEffect } from 'react';
import React from 'react';

interface DarkModeProviderProps {
  children: ReactNode;
}

const DarkModeProvider = ({ children }: DarkModeProviderProps) => {
  useEffect(() => {
    // Function to check and apply theme
    // Check for saved preference or system preference
    const applyTheme = () => {
      const isDark = localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply immediately
    applyTheme();

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
      console.log('Cleanup: Removed theme listener'); // For debugging
    };
  }, []);

  return <>{children}</>;
};

export { DarkModeProvider };