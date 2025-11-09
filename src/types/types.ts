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

export const getPostsDataInclude = (loggedInUserId: number | null) => {
  return {
    authorProfile: {
      include: {
        followers: {
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    },
    attachment: true,
    votes: {
      where: {
        profileId: loggedInUserId ?? undefined,
      },
      select: {
        profileId: true,
      },
    },
    bookmarks: loggedInUserId
      ? {
          where: {
            profileId: loggedInUserId,
          },
          select: {
            profileId: true,
          },
        }
      : false,
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

export type VoteInfo = {
  votes: number;
  isVotedByUser: boolean;
};

export type BookmarkInfo = {
  isBookmarkedByUser: boolean;
};

export const getProfileDataSelect = (loggedInUserId: number | null) => {
  return {
    id: true,
    userId: true,
    role: true,
    username: true,
    displayName: true,
    profilePicture: true,
    bio: true,
    createdAt: true,
    updatedAt: true,
    followers: {
      where: {
        followerId: loggedInUserId ?? undefined,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.ProfilesSelect;
};

// Now supports including parent Post info safely
export const getCommentDataInclude = (
  loggedInUserId: number | null,
  includePost: boolean = false
) => {
  return {
    authorProfile: {
      select: getProfileDataSelect(loggedInUserId),
    },
    commentVotes: {
      where: {
        profileId: loggedInUserId ?? undefined,
      },
      select: {
        profileId: true,
        voteType: true,
      },
    },
    _count: {
      select: {
        commentVotes: true,
      },
    },
    ...(includePost && {
      posts: {
        select: {
          id: true,
          type: true,
          authorProfileId: true,
        },
      },
    }),
  } as const;
};

// Safer inference for CommentData
export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

// Notifications
export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      profilePicture: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface ProfileAdmin extends Profile {
  user: {
    email?: string | null;
    phoneNumber?: string | null;
    status?: string | null;
  };
}

export type Topic = {
  id: number;
  title: string;
  description?: string;
  communityId?: number;
  groupId?: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
};

export type TopicGroup = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdById: number;
  topics: Topic[];
  createdBy: {
    id: number;
    displayName: string;
    username: string;
    profilePicture: string;
  };
};
