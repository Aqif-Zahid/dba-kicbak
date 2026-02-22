import { UserNotFound } from "@/components/admin/users/user-not-found";
import { redirect } from "next/navigation";
import { getServerSessionFromApi } from "@/lib/server-session";
import { cookies } from "next/headers";
import { decryptCookie } from "@/lib/encrypt";
import { CompleteProfileMain } from "@/components/auth/complete-profile-main";

interface PendingUser {
  id: string;
  email: string;
  displayName: string;
  image?: string;
}

interface PageProps {
  searchParams: Promise<{ userId: string; email: string }>;
}

const CompleteProfilePage = async ({ searchParams }: PageProps) => {
  const queryParams = await searchParams;

  if (!queryParams.email) {
    throw new Error("Invalid url");
  }

  // Fetch logged-in user
  const session = await getServerSessionFromApi();
  const currentUser = session?.user;
  //Cookie parsing
  const cookieStore = await cookies();
  const pendingUserCookie = cookieStore.get("pendingUser")?.value;

  if (!pendingUserCookie || currentUser) {
    redirect("/");
  }

  let userData: PendingUser;
  try {
    userData = decryptCookie(pendingUserCookie) as PendingUser;
  } catch (e) {
    console.error("Failed to decrypt pendingUser cookie:", e);
    redirect("/");
  }
  //Check if the user is valid or not
  if (!userData || userData.id !== queryParams.userId) {
    return <UserNotFound />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <CompleteProfileMain userData={userData} />
    </div>
  );
};

export default CompleteProfilePage;
