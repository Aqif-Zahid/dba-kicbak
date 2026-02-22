"use client";

import { Button } from "@/components/ui/button";
import { ExtendedProfile } from "@/types/types";
import { useState } from "react";
import { ProfileModal } from "../profile/profile-modal";

interface EditProfileButtonProps {
  user: ExtendedProfile;
}
export const EditProfileButton = ({ user }: EditProfileButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      <ProfileModal
        data={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          profilePicture: user.profilePicture,
        }}
        isOpen={showDialog}
        close={() => setShowDialog(false)}
        from={"username"}
      />
    </>
  );
};
