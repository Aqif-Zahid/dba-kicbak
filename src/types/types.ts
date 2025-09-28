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
