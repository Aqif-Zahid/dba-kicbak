// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
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
  }
}
