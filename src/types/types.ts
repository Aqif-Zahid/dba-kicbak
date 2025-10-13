import { Prisma } from "@prisma/client";

export type User = {
  id: number;
  email?: string | null;
  displayName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
  personaTags?: string | [];
  dateOfBirth?: string | null;
  positionNumber?: number;
  profilePicture?: string | null;
  defaultProfileId: number;
  points?: number;
  status: string;
  bio?: string;
  createdAt: string;
};

export type Profile = {
  id: number;
  userId: number;
  role: string;
  createdAt: Date | null;
  updatedAt: Date;
  username: string;
  displayName: string;
  profilePicture?: string | null;
  personaTags?: any;
  bio: string | null;
  totalPosts?: number;
  totalFollowing?: number;
  totalFollowers?: number;
};

export type ExtendedProfile = Profile & {
  user: Pick<User, "id" | "email" | "createdAt"> & { createdAt: Date | null };
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  followers: {
    followerId: number;
    followingId: number;
  }[];
};

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}

export const getPostsDataInclude = (loggedInUserId: number) => {
  return {
    authorProfile: true,
    attachment: true,
    votes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        profileId: loggedInUserId,
      },
      select: {
        profileId: true,
      },
    },
    _count: {
      select: {
        votes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
};

export type Post = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostsDataInclude>;
}>;

export interface PostsPage {
  posts: Post[];
  nextCursor: string | null;
}

export type Bookmark = {
  id: string;
  profileId: number;
  postId: number;
  createdAt: Date;

  // Relations (optional)
  userProfile?: Profile;
  post?: Post;
};

export type Comment = {
  id: number;
  postId: number;
  content: string;
  upvotes?: number | null;
  downvotes?: number | null;
  parentId?: number | null;
  createdAt?: Date | null;
  updatedAt: Date;
  status: string;
  authorProfileId: number;

  // Relations
  authorProfile?: Profile;
  posts?: Post;
  mentions?: Mention[];
  votes?: Vote[];
};

export type Mention = {
  id: number;
  userId: number;
  postId?: number | null;
  commentId?: number | null;
  createdAt: Date | null;

  comments?: Comment | null;
  posts?: Post | null;
  users?: User;
};
export type Vote = {
  id: number;
  userId: number;
  postId?: number | null;
  commentId?: number | null;
  voteType: string;
  createdAt: Date | null;
};

export type FollowerInfo = {
  followers: number;
  isFollowedByUser: boolean;
};

export type LikeInfo = {
  likes: number;
  isLikedByUser: boolean;
};

export type BookmarkInfo = {
  isBookmarkedByUser: boolean;
};

export const getCommentDataInclude = (loggedInUserId: string) => {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
};

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}
