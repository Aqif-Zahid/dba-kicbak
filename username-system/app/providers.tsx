'use client';

import { ClerkProvider } from '@clerk/nextjs';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Optional sanity check. This logs only a boolean.
  if (typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'undefined') {
    console.warn('Clerk publishable key missing');
  }
  return <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>;
}
