import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type {
  Users as UserType,
  Profiles as ProfileType,
} from "@prisma/client";

// Extend the NextAuth User type to include defaultProfileId
declare module "next-auth" {
  interface User {
    defaultProfileId?: string | number | null;
  }
}

type UserWithRelations = UserType & {
  profiles: ProfileType[];
  defaultProfile: ProfileType | null;
};

export const authOptions: AuthOptions = {
  providers: [
    // --- Credentials Login ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const userRecord = (await prisma.users.findUnique({
          where: { email: credentials.email },
          include: { profiles: true, defaultProfile: true },
        })) as UserWithRelations | null;

        if (
          !userRecord ||
          !userRecord.passwordHash ||
          userRecord.status !== "ACTIVE"
        )
          return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          userRecord.passwordHash
        );
        if (!isValid) return null;
        return {
          id: userRecord.id.toString(),
          email: userRecord.email,
          status: userRecord.status,
          role: userRecord.defaultProfile?.role ?? null,
          displayName: userRecord.defaultProfile?.displayName ?? null,
          username: userRecord.defaultProfile?.username ?? null,
          profilePicture: userRecord.defaultProfile?.profilePicture ?? null,
          phoneNumber: userRecord.phoneNumber,
          dateOfBirth: userRecord.dateOfBirth,
          defaultProfileId: userRecord.defaultProfileId,
        };
      },
    }),

    // --- Google Login ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        let existingUser = (await prisma.users.findUnique({
          where: { email: profile.email },
          include: { profiles: true, defaultProfile: true },
        })) as UserWithRelations | null;

        // --- New User ---
        if (!existingUser) {
          existingUser = await prisma.users.create({
            data: {
              email: profile.email!,
              authProvider: "GOOGLE",
              status: "PENDING",
            },
            include: { profiles: true, defaultProfile: true },
          });

          return {
            id: existingUser.id.toString(),
            email: existingUser.email,
            status: existingUser.status,
            role: null,
            displayName: null,
            username: null,
            profilePicture: profile.picture ?? null,
            phoneNumber: null,
            dateOfBirth: null,
            defaultProfileId: existingUser.defaultProfileId,
          };
        }

        // --- Existing User ---
        return {
          id: existingUser.id.toString(),
          email: existingUser.email,
          status: existingUser.status,
          role: existingUser.defaultProfile?.role ?? null,
          displayName: existingUser.defaultProfile?.displayName ?? null,
          username: existingUser.defaultProfile?.username ?? null,
          profilePicture:
            existingUser.defaultProfile?.profilePicture ??
            profile.picture ??
            null,
          phoneNumber: existingUser.phoneNumber,
          dateOfBirth: existingUser.dateOfBirth,
          defaultProfileId: existingUser.defaultProfileId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // When the user logs in for the first time or the token is refreshed
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.defaultProfileId = user.defaultProfileId;
      }
      // When session is manually updated (e.g., after switching profiles)
      if (trigger === "update" && session?.user?.defaultProfileId) {
        token.defaultProfileId = session.user.defaultProfileId;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          defaultProfileId: token.defaultProfileId,
        } as any;
      }

      return session;
    },
  },

  pages: { signIn: "/auth/signin" },
};

// --- App Router compatibility ---
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
