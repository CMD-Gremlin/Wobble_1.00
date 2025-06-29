'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from '@/app/auth/AuthGuard';
import React from 'react';

/**
 * AuthWrapper
 * Client-side component that decides whether to wrap children with AuthGuard.
 * Prevents server-component hook errors by isolating usePathname in a client file.
 */
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ['/auth/login', '/auth/callback', '/auth/error', '/test'];
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route));

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <AuthGuard>{children}</AuthGuard>;
}
