"use client";

import { ChangePasswordMain } from "@/components/change-password/ChangePasswordMain";
import { EmailAliasForm } from "@/components/user-settings/email-alias-form";

export const UserSettingsMain = () => {
  return (
    <div className="flex flex-col items-center pb-20 w-full space-y-8">
      <ChangePasswordMain />
      <EmailAliasForm />
    </div>
  );
};
