import { UserNotFound } from "@/components/admin/users/user-not-found";
import { redirect } from "next/navigation";
import { getApiBaseUrl, getServerSessionFromApi } from "@/lib/server-session";
import { InvitationMain } from "@/components/invitation/invitation-main";

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

  const base = getApiBaseUrl();

  const [refRes, emailRes] = await Promise.all([
    fetch(`${base}/api/invite/validate-referral/${encodeURIComponent(resolvedParams.referralCode)}`, {
      cache: "no-store",
    }),
    fetch(`${base}/api/invite/check-email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ email: queryParams.email }),
    }),
  ]);

  const refJson = refRes.ok ? await refRes.json() : null;
  const emailJson = emailRes.ok ? await emailRes.json() : null;

  const user = refJson?.data?.valid ? { valid: true } : null;
  const userWithEmail = emailJson?.data?.exists ? { exists: true } : null;

  // Fetch logged-in user
  const session = await getServerSessionFromApi();
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
