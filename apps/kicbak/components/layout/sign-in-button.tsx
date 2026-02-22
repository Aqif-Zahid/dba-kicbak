"use client";

import { useSigninModal } from "@/hooks/use-signin-modal";

export const SignInButton = () => {
  const { open } = useSigninModal();
  return (
    <div className="flex gap-4">
      <button
        onClick={open}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer animate-pulse shadow-lg shadow-primary/25"
      >
        Sign in
      </button>
    </div>
  );
};
