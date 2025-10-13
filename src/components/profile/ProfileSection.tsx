"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { Loader2, Star, Trash2, Pencil } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ResponsiveModal from "@/components/modals/responsive-modal";

interface Profile {
  id: number;
  username: string;
  displayName: string;
  role: string;
  profilePicture?: string;
  bio?: string;
}

interface ProfileSectionProps {
  userId: number;
}

export default function ProfileSection({ userId }: ProfileSectionProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
  });
  const [defaultProfileId, setDefaultProfileId] = useState<number | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // === Fetch profiles
  const fetchProfiles = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await axios.get(`/api/profiles?userId=${userId}`);
      setProfiles(res.data.profiles || []);
      setDefaultProfileId(res.data.defaultProfileId || null);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      toast.error("Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchProfiles();
  }, [userId]);

  // === Create or update profile
  const handleSubmit = async () => {
    setUsernameError(null);
    if (!userId) return;

    try {
      if (editingProfile) {
        await axios.patch(`/api/profiles/${editingProfile.id}`, {
          userId,
          ...formData,
        });
        toast.success("Profile updated successfully!");
      } else {
        await axios.post("/api/profiles", {
          userId,
          ...formData,
        });
        toast.success("Profile created successfully!");
      }

      setModalOpen(false);
      setFormData({ username: "", displayName: "", bio: "" });
      setEditingProfile(null);
      fetchProfiles();
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.error;

      if (status === 409) {
        setUsernameError("This username is already taken.");
      } else if (status === 400) {
        toast.error(backendMessage || "⚠️ Validation failed. Please try again.");
      } else if (status === 401) {
        toast.error("⚠️ Unauthorized. Please sign in again.");
      } else if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error("Unexpected error while saving profile.");
      }
    }
  };

  // === Delete profile
  const handleDelete = async (id: number) => {
    if (profiles.length <= 1) {
      toast.error("At least one profile must exist!");
      return;
    }

    if (!confirm("Are you sure you want to delete this profile?")) return;

    try {
      await axios.delete(`/api/profiles/${id}`, {
        data: { userId },
      });
      toast.success("Profile deleted successfully!");
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete profile.");
    }
  };

  // === Set default profile
  const handleSetDefault = async (id: number) => {
    try {
      await axios.patch("/api/profiles/default", {
        userId,
        profileId: id,
      });
      toast.success("Default profile updated!");
      setDefaultProfileId(id);
    } catch (error) {
      toast.error("Failed to set default profile.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Profiles</h2>
          <Button
            onClick={() => {
              setEditingProfile(null);
              setFormData({ username: "", displayName: "", bio: "" });
              setUsernameError(null);
              setModalOpen(true);
            }}
          >
            + Create Profile
          </Button>
        </div>

        {/* === Profile List === */}
        <div className="grid gap-3">
          {profiles.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No profiles found. Create one to get started.
            </p>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex gap-3 items-center">
                  <Avatar>
                    <AvatarImage src={profile.profilePicture || ""} />
                    <AvatarFallback>
                      {profile.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.displayName}</p>
                    <p className="text-xs text-gray-500">
                      @{profile.username} — {profile.role}
                    </p>
                    {profile.bio && (
                      <p className="text-xs text-gray-600 mt-1">{profile.bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingProfile(profile);
                      setFormData({
                        username: profile.username,
                        displayName: profile.displayName,
                        bio: profile.bio || "",
                      });
                      setUsernameError(null);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(profile.id)}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                  <Button
                    variant={
                      defaultProfileId === profile.id ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handleSetDefault(profile.id)}
                    disabled={defaultProfileId === profile.id}
                  >
                    <Star
                      className={
                        defaultProfileId === profile.id
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }
                    />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Modal (no image URL field) */}
      <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen} size="sm">
        <div className="text-center mb-4">
          <h2 className="font-bold text-gray-700 text-lg">
            {editingProfile ? "Edit Profile" : "Create New Profile"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {editingProfile
              ? "Update your profile details below."
              : "Fill out the form to create your new profile."}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className={usernameError ? "border-red-500" : ""}
          />
          {usernameError && (
            <p className="text-red-500 text-xs mt-1">{usernameError}</p>
          )}

          <Input
            placeholder="Display Name"
            value={formData.displayName}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.target.value })
            }
          />

          <Textarea
            placeholder="Bio"
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
          />

          <Button onClick={handleSubmit} className="w-full">
            {editingProfile ? "Update" : "Create"}
          </Button>
        </div>
      </ResponsiveModal>

      <Toaster richColors position="top-center" />
    </>
  );
}
