import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

// Require authentication
export const requireAuth = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return session;
};

// Require unauthenticated (e.g., for login/register pages)
export const requireUnauth = async () => {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }
};
