"use client";

import Image from "next/image";
import { SigninModal } from "../auth/signin-modal";
import { SignupModal } from "../auth/signup-modal";
import { useState } from "react";
import { RequestInviteCodeModal } from "../auth/request-invite-code-modal";

export const Header = () => {
  const isSignedIn = false;
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);

  return (
    <header className="border-b border-border">
      <SigninModal />
      <SignupModal />
      {showInviteCodeModal && (
        <RequestInviteCodeModal
          show={showInviteCodeModal}
          setShow={setShowInviteCodeModal}
        />
      )}

      {isSignedIn ? (
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Image
            src="/kicbak-logo.png"
            alt="Kicbak"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
          {/* <UserButton /> */}
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
              onClick={() => setShowInviteCodeModal(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer animate-pulse shadow-lg shadow-primary/25"
            >
              Request An Invite
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
