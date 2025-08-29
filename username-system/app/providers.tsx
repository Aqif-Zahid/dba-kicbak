'use client';

import { ClerkProvider } from '@clerk/nextjs';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey="pk_test_bmljZS1wZWxpY2FuLTYwLmNsZXJrLmFjY291bnRzLmRldiQ">
      {children}
    </ClerkProvider>
  );
}
