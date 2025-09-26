export type User = {
  id: number | string;
  email?: string | null;
  displayName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  personaTags?: string | [];
  dateOfBirth?: string | null;
  positionNumber?: number;
  profilePicture?: string | null;
  points?: number;
  createdAt?: string;
};
