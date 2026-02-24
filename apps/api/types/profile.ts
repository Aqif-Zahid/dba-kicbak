import { ProfileRole } from "@prisma/client";

type Follower = {
  followerId: number;
  followingId?: number; // optional if not always returned
};

export type ProfileResponse = {
  id: number;
  userId: number;
  role: ProfileRole;
  bio: string | null;
  createdAt: Date | null;
  updatedAt: Date;
  username: string;
  displayName: string;
  profilePicture: string | null;
  followers: Follower[];
  _count: {
    followers: number;
  };
};
