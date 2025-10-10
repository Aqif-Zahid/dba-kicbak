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
  points?: number;
  status: string;
  createdAt: string;
};

export type Profile = {
  id: number;
  userId: number;
  role: string;
  createdAt?: Date | null;
  updatedAt: Date;
  username: string;
  displayName: string;
  profilePicture?: string | null;
  personaTags?: any;
};

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}
