import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type {
  Users as UserType,
  Profiles as ProfileType,
} from "@prisma/client";

// Extend NextAuth User type
declare module "next-auth" {
  interface User {
    id: string;
    status: string;
    role: string | null;
    username: string | null;
    displayName: string | null;
    image: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    defaultProfileId: string | number | null;
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
          include: { defaultProfile: true },
        })) as UserWithRelations | null;

        if (
          !userRecord ||
          !userRecord.passwordHash ||
          userRecord.status !== "ACTIVE"
        ) {
          return null;
        }

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
          image: userRecord.defaultProfile?.profilePicture ?? null,
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
        const existingUser = (await prisma.users.findUnique({
          where: { email: profile.email },
          include: { defaultProfile: true },
        })) as UserWithRelations | null;

        if (!existingUser || existingUser.status !== "ACTIVE") {
          let newUser = existingUser;
          if (!existingUser) {
            newUser = await prisma.users.create({
              data: {
                email: profile.email!,
                authProvider: "GOOGLE",
                status: "PENDING",
              },
              include: { profiles: true, defaultProfile: true },
            });
          }
          return {
            id: newUser?.id.toString() || "0", //Temporary will check for a better solution
            email: newUser?.email,
            status: "PENDING",
            role: null,
            displayName: `${profile.given_name}_${profile.family_name}`,
            username: null,
            image: profile.image,
            phoneNumber: null,
            dateOfBirth: null,
            defaultProfileId: newUser?.defaultProfileId || 0,
          };
        }

        return {
          id: existingUser.id.toString(),
          email: existingUser.email,
          status: existingUser.status,
          role: existingUser.defaultProfile?.role ?? null,
          displayName: existingUser.defaultProfile?.displayName ?? null,
          username: existingUser.defaultProfile?.username ?? null,
          image: existingUser.defaultProfile?.profilePicture ?? null,
          phoneNumber: existingUser.phoneNumber,
          dateOfBirth: existingUser.dateOfBirth,
          defaultProfileId: existingUser.defaultProfileId,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user?.email) return false;

      const existingUser = (await prisma.users.findUnique({
        where: { email: user.email },
        include: { defaultProfile: true },
      })) as UserWithRelations | null;

      // New or Pending → return redirect URL as string
      if (!existingUser || existingUser.status === "PENDING") {
        return `/api/auth/complete-profile/set-cookie?id=${
          user.id
        }&email=${encodeURIComponent(
          user.email
        )}&displayName=${encodeURIComponent(
          user.displayName || ""
        )}&image=${encodeURIComponent(user.image || "")}`;
      }

      // Active → allow login normally
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
        if ((user as any).redirectTo)
          token.redirectTo = (user as any).redirectTo;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = { ...session.user, ...token } as typeof session.user;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};

// --- App Router handlers ---
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
