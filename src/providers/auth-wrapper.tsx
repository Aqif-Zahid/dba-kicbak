"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "./auth-provider";

export const AuthWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
};
