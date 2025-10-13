"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Loader2, Star, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileModal } from "./profile-modal";
import { useGetProfiles } from "@/services/profiles/use-get-profiles";
import { Profile } from "@/types/types";
import { FaPencilAlt } from "react-icons/fa";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProfile } from "@/services/profiles/use-delete-profile";
import { signIn } from "next-auth/react";

interface ProfileSectionProps {
  user: any;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const { data: result, isFetching } = useGetProfiles();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const handleUpdateProfile = (item: Profile) => {
    setSelectedProfile(item);
    setShowUpdateModal(true);
  };

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Profile",
    "This action can not be undone",
    "destructive"
  );

  const { mutate, isPending } = useDeleteProfile();
  const onDelete = async (item: Profile) => {
    const ok = await confirm();
    if (!ok) {
      return;
    }
    mutate({
      id: item.id,
    });
  };

  const switchProfile = async (newProfileId: number) => {
    try {
      const res = await axios.post("/api/auth/switch-profile", {
        newProfileId,
      });

      if (res.data.status === 1) {
        await signIn("refresh", {
          redirect: false,
          defaultProfileId: newProfileId,
        });
        toast.success("Profile switched successfully!");
      }
    } catch (error) {
      console.error("Failed to switch profile:", error);
      toast.error("Failed to switch profile. Please try again.");
    }
  };

  if (isFetching || !result) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Profiles</h2>
          <Button onClick={() => setShowAddModal(true)}>
            + Create Profile
          </Button>
        </div>

        {/* === Profile List === */}
        <div className="grid gap-3">
          {result.data.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No profiles found. Create one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {result.data.map((profile) => (
                <div
                  key={profile.id}
                  className="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  {/* Default Badge */}
                  {user.defaultProfileId === profile.id && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}

                  {/* Profile Info */}
                  <div className="flex flex-col items-center text-center p-6">
                    <Avatar className="w-24 h-24 mb-3 border-2 border-gray-200 rounded-full">
                      <AvatarImage src={profile.profilePicture || ""} />
                      <AvatarFallback className="text-3xl font-bold">
                        {profile.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-lg">
                      {profile.displayName}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      @{profile.username} — {profile.role}
                    </p>
                    {profile.bio && (
                      <p className="text-xs text-gray-600 mb-4">
                        {profile.bio}
                      </p>
                    )}

                    {/* User Stats */}
                    <div className="flex gap-6 text-sm text-gray-600 font-medium mb-2">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-800">
                          {profile.totalPosts || 0}
                        </span>
                        <span>Posts</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-800">
                          {profile.totalFollowers || 0}
                        </span>
                        <span>Followers</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-800">
                          {profile.totalFollowing || 0}
                        </span>
                        <span>Following</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay Actions */}
                  <div className="transition-all duration-300 flex justify-center items-end px-4 pb-8">
                    <div className="flex gap-3 backdrop-blur-sm bg-white/70 rounded-xl p-2">
                      <Button
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleUpdateProfile(profile)}
                        disabled={isPending}
                      >
                        <FaPencilAlt size={16} /> Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-red-500"
                        onClick={() => onDelete(profile)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>

                      <Button
                        variant={
                          user.defaultProfileId === profile.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => switchProfile(profile.id)}
                        disabled={
                          user.defaultProfileId === profile.id || isPending
                        }
                        className="flex items-center gap-1"
                      >
                        <Star
                          className={
                            user.defaultProfileId === profile.id
                              ? "fill-yellow-400 text-yellow-400 w-4 h-4"
                              : "text-gray-400 w-4 h-4"
                          }
                        />{" "}
                        {user.defaultProfileId === profile.id
                          ? "Default"
                          : "Set Default"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster richColors position="top-center" />
      {showAddModal && (
        <ProfileModal
          isOpen={showAddModal}
          close={() => setShowAddModal(false)}
        />
      )}

      {showUpdateModal && selectedProfile && (
        <ProfileModal
          isOpen={showUpdateModal}
          close={() => setShowUpdateModal(false)}
          data={selectedProfile}
        />
      )}
    </>
  );
}
