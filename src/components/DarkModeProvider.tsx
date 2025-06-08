// components/DarkModeProvider.jsx
'use client'; // Required if using Next.js 13+ App Router

import { ReactNode, useEffect } from 'react';
import React from 'react';

interface DarkModeProviderProps {
  children: ReactNode;
}

const DarkModeProvider = ({ children }: DarkModeProviderProps) => {
  useEffect(() => {
    // Check for theme preference and track it. If the user changes theme, this will be called and add or remove the 'dark' class to or from the whole page, appropriately
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
    };
  }, []);

  return <>{children}</>;
};

export { DarkModeProvider };