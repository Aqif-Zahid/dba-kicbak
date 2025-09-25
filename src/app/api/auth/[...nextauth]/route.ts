import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
// import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { authProviderEnum, users } from "@/db/schema";

// --- Drizzle ORM setup ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// --- NextAuth configuration ---
export const authOptions: AuthOptions = {
  providers: [
    // Credentials login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user[0] || !user[0].passwordHash || user[0].status !== "ACTIVE")
          return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user[0].passwordHash
        );

        if (!isValid) return null;

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].displayName,
          role: user[0].role,
        };
      },
    }),

    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Apple login (optional)
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: {
    //     appleId: process.env.APPLE_CLIENT_ID!,
    //     teamId: process.env.APPLE_TEAM_ID!,
    //     privateKey: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    //     keyId: process.env.APPLE_KEY_ID!,
    //   },
    // }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Attach role to JWT
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
      }

      // --- Auto create social user if first login ---
      if (account && account.provider !== "credentials" && !user) {
        const email = token.email;
        if (email) {
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (existing.length === 0) {
            const inserted = await db
              .insert(users)
              .values({
                email,
                username: email.split("@")[0],
                displayName: email.split("@")[0],
                status: "ACTIVE",
                role: "TRAVELER",
                personaTags: [],
                provider:
                  account.provider.toUpperCase() as (typeof authProviderEnum.enumValues)[number],
              })
              .returning();

            token.id = inserted[0].id.toString();
            token.role = inserted[0].role;
          } else {
            token.id = existing[0].id.toString();
            token.role = existing[0].role;
          }
        }
      }

      return token;
    },

    // Attach JWT data to session
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
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
