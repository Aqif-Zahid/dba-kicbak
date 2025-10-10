interface Session {
  user: {
    id: string;
    role: string;
    displayName?: string | null;
    username?: string | null;
    phoneNumber?: string | null;
    profilePicture?: string | null;
    dateOfBirth?: string | null;
    email?: string | null;
    allProfiles?: {
      id: number;
      displayName: string;
      profilePicture: string | null;
      role: string;
    }[];
  };
}

interface User {
  id: string;
  role: string;
  displayName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  dateOfBirth?: string | null;
  allProfiles?: {
    id: number;
    displayName: string;
    profilePicture: string | null;
    role: string;
  }[];
}

interface JWT {
  id: string;
  role: string;
  displayName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
  allProfiles?: {
    id: number;
    displayName: string;
    profilePicture: string | null;
    role: string;
  }[];
}
