interface Session {
  user: {
    id: string;
    role: string;
    displayName?: string | null;
    username?: string | null;
    phoneNumber?: string | null;
    profilePicture?: string | null;
    dateOfBirth?: string | null;
    defaultProfileId: number;
    email?: string | null;
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
  defaultProfileId: number;
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
  defaultProfileId: number;
}
