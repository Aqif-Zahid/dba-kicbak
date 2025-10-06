import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import { authProviderEnum, users, profiles, userStatusEnum } from "@/db/schema";

// --- Drizzle ORM setup ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// --- Extended User Type for Session ---
// This interface now defines the full structure returned by authorize/profile,
// which often conflicts with NextAuth's base User type (e.g., fields being nullable).
// We define it explicitly instead of extending User.
export interface ExtendedUser {
  // Required core fields from NextAuth User (Email and ID)
  id: string;
  email: string;
  
  // Custom Drizzle/Session fields
  status: string;
  role: string | null;
  displayName: string | null;
  username: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  dateOfBirth: string | null;
  allProfiles: {
    id: number;
    displayName: string;
    profilePicture: string | null;
    role: string;
  }[];
}

// --- NextAuth configuration ---
export const authOptions: AuthOptions = {
  providers: [
    // Credentials login (Scenario 1)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Fetch user data
        const [userRecord] = await db
          .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            status: users.status, 
            phoneNumber: users.phoneNumber,
            dateOfBirth: users.dateOfBirth,
            defaultProfileId: users.defaultProfileId,
          })
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        // Check if user exists, has a password hash, and is active
        if (!userRecord || !userRecord.passwordHash || userRecord.status !== "ACTIVE")
          return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          userRecord.passwordHash
        );

        if (!isValid) return null;

        // 2. Fetch the active default profile details
        const [defaultProfile] = await db
          .select({
            role: profiles.role,
            displayName: profiles.displayName,
            username: profiles.username,
            profilePicture: profiles.profilePicture,
          })
          .from(profiles)
          .where(eq(profiles.id, userRecord.defaultProfileId!))
          .limit(1);
        let allProfiles;
        let profileMap;
        if (defaultProfile) {
          // 3. Fetch all profiles for the user
          allProfiles = await db
              .select({
                  id: profiles.id,
                  displayName: profiles.displayName,
                  profilePicture: profiles.profilePicture,
                  role: profiles.role,
              })
              .from(profiles)
              .where(eq(profiles.userId, userRecord.id));
          profileMap = allProfiles.map(p => ({
            id: p.id,
            displayName: p.displayName,
            profilePicture: p.profilePicture,
            role: p.role}));
        }



        // 4. Construct the ExtendedUser object
        return {
          id: userRecord.id.toString(),
          email: userRecord.email,
          status: userRecord.status,
          // Default Profile fields
          role: defaultProfile.role ?? '',
          displayName: defaultProfile.displayName,
          username: defaultProfile.username,
          profilePicture: defaultProfile.profilePicture,
          // User fields
          phoneNumber: userRecord.phoneNumber,
          dateOfBirth: userRecord.dateOfBirth,
          // All Profiles
          allProfiles: allProfiles.map(p => ({
            id: p.id,
            displayName: p.displayName,
            profilePicture: p.profilePicture,
            role: p.role,
          })),
        } as ExtendedUser;
      },
    }),

    // Google Sign-in (Scenario 3)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      async profile(profile) {
        // 1. Check for existing user
        const [existingUserRecord] = await db
          .select({
            id: users.id,
            email: users.email,
            status: users.status, 
            phoneNumber: users.phoneNumber,
            dateOfBirth: users.dateOfBirth,
            defaultProfileId: users.defaultProfileId,
          })
          .from(users)
          .where(eq(users.email, profile.email))
          .limit(1);

        // --- NEW USER (PENDING) ---
        if (!existingUserRecord) {
          // Scenario 3: New user via Google -> PENDING status, NO profile created
          const [inserted] = await db
            .insert(users)
            .values({
              email: profile.email,
              provider: authProviderEnum.enumValues[1], // GOOGLE
              status: userStatusEnum.enumValues[1], // PENDING
              createdAt: sql.raw('now()'),
              updatedAt: sql.raw('now()'),
            })
            .returning({ id: users.id, email: users.email, status: users.status });

          return {
            id: inserted[0].id.toString(),
            email: inserted[0].email,
            status: inserted[0].status,
            // Profile fields are null/undefined as no profile was created
            role: null,
            displayName: null,
            username: null,
            phoneNumber: null,
            profilePicture: profile.picture,
            dateOfBirth: null,
            allProfiles: [], // No profiles yet
          } as ExtendedUser;
        }

        // --- EXISTING USER ---
        
        // 2. Fetch the active default profile details
        let defaultProfile = null;
        if (existingUserRecord.defaultProfileId) {
            [defaultProfile] = await db
                .select({
                    role: profiles.role,
                    displayName: profiles.displayName,
                    username: profiles.username,
                    profilePicture: profiles.profilePicture,
                })
                .from(profiles)
                .where(eq(profiles.id, existingUserRecord.defaultProfileId))
                .limit(1);
        }

        // 3. Fetch all profiles for the user
        const allProfiles = await db
            .select({
                id: profiles.id,
                displayName: profiles.displayName,
                profilePicture: profiles.profilePicture,
                role: profiles.role,
            })
            .from(profiles)
            .where(eq(profiles.userId, existingUserRecord.id));

        
        // 4. Construct the ExtendedUser object
        return {
          id: existingUserRecord.id.toString(),
          email: existingUserRecord.email,
          status: existingUserRecord.status,
          // Default Profile fields (may be null if PENDING)
          role: defaultProfile?.role || null,
          displayName: defaultProfile?.displayName || null,
          username: defaultProfile?.username || null,
          profilePicture: defaultProfile?.profilePicture || profile.picture, 
          // User fields
          phoneNumber: existingUserRecord.phoneNumber,
          dateOfBirth: existingUserRecord.dateOfBirth,
          // All Profiles
          allProfiles: allProfiles.map(p => ({
            id: p.id,
            displayName: p.displayName,
            profilePicture: p.profilePicture,
            role: p.role,
          })),
        } as ExtendedUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        // user object comes from authorize() or profile()
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.email = extendedUser.email;
        token.status = extendedUser.status; // Status is essential for profile completion check
        token.role = extendedUser.role;
        token.displayName = extendedUser.displayName;
        token.username = extendedUser.username;
        token.phoneNumber = extendedUser.phoneNumber;
        token.profilePicture = extendedUser.profilePicture;
        token.dateOfBirth = extendedUser.dateOfBirth;
        token.allProfiles = extendedUser.allProfiles; // ADDED: All profiles
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email,
          status: token.status as string, // Status is essential for profile completion check
          role: token.role as string,
          displayName: token.displayName as string,
          username: token.username as string,
          phoneNumber: token.phoneNumber as string,
          profilePicture: token.profilePicture as string,
          dateOfBirth: token.dateOfBirth as string,
          allProfiles: token.allProfiles as ExtendedUser["allProfiles"], // ADDED: All profiles
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};

// --- App Router requires named exports for HTTP methods ---
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
