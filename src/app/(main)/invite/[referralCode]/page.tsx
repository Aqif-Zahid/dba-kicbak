import { UserNotFound } from "@/components/admin/users/user-not-found";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { InvitationMain } from "@/components/invitation/invitation-main";
import { getUserDetails } from "@/actions/user/user-actions";

interface PageProps {
  params: Promise<{ referralCode: string }>;
}

const UserPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  // Fetch user by username
  const user = await getUserDetails(resolvedParams.referralCode);

  // Fetch logged-in user
  const session = await getServerSession(authOptions);
  const currentUser = session?.user;

  //Check if the user is valid or not
  if (!user) {
    return <UserNotFound />;
  }
  //Redirect already logged in user
  if (currentUser) {
    redirect("/");
  }

  return <InvitationMain referralCode={resolvedParams.referralCode} />;
};

export default UserPage;
