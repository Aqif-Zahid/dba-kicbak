import { UserNotFound } from "@/components/admin/users/user-not-found";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { InvitationMain } from "@/components/invitation/invitation-main";
import { checkUserMail, getUserDetails } from "@/actions/user/user-actions";

interface PageProps {
  params: Promise<{ referralCode: string }>;
  searchParams: Promise<{ email: string }>;
}

const UserPage = async ({ params, searchParams }: PageProps) => {
  const resolvedParams = await params;
  const queryParams = await searchParams;

  if (!queryParams.email) {
    throw new Error("Invalid url");
  }

  const [user, userWithEmail] = await Promise.all([
    getUserDetails(resolvedParams.referralCode),
    checkUserMail(queryParams.email),
  ]);

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

  return (
    <InvitationMain
      referralCode={resolvedParams.referralCode}
      email={queryParams.email}
    />
  );
};

export default UserPage;
