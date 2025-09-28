"use client";

import Image from "next/image";
import { SigninModal } from "../auth/signin-modal";
import { UserButton } from "./user-button";
import { useUser } from "@/providers/auth-provider";
import { RequestInviteCodeModal } from "../auth/request-invite-code-modal";
import { useSigninModal } from "@/hooks/use-signin-modal";
import Link from "next/link";

export const Header = () => {
  const { user } = useUser();
  const { open } = useSigninModal();

  return (
    <header className="border-b border-border">
      <SigninModal />
      <RequestInviteCodeModal />

      {user ? (
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/kicbak-logo.png"
              alt="Kicbak"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </Link>
          <UserButton />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Image
            src="/kicbak-logo.png"
            alt="Kicbak"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
          <div className="flex gap-4">
            <button
              onClick={open}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer animate-pulse shadow-lg shadow-primary/25"
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
