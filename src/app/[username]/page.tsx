import Head from "next/head";
import { Layout } from "@/components/layout/layout";
import { Sidebar } from "@/components/admin/sidebar";
import { ProfileMain } from "@/components/admin/profile/profile-main";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getUserDetails } from "@/actions/user-actions";
import { UserNotFound } from "@/components/users/user-not-found";

const UserPage = async ({ params }: { params: { username: string } }) => {
  const { username } = params;

  // Fetch user by username
  const user = await getUserDetails(username);

  // Fetch logged-in user
  const session = await getServerSession(authOptions);
  const currentUser = session?.user;

  // --- Case 1: User not found ---
  if (!user) {
    return (
      <Layout>
        <UserNotFound />
      </Layout>
    );
  }

  // --- Case 2: Current user viewing own profile ---
  if (currentUser && currentUser.username === user.username) {
    return (
      <>
        <Head>
          <title>My Profile</title>
        </Head>
        <Layout>
          <section className="pb-20">
            <div className="container mx-auto px-4">
              <div className="flex min-h-screen flex-col">
                <div className="max-w-7xl mx-auto p-5 flex w-full grow gap-5">
                  <Sidebar className="sticky top-[5.50rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80" />
                  <ProfileMain user={currentUser} />
                </div>
                <Sidebar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
              </div>
            </div>
          </section>
        </Layout>
      </>
    );
  }

  // --- Case 3: Viewing another user's profile ---
  return (
    <>
      <Head>
        <title>{user.displayName} Profile</title>
      </Head>
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex min-h-screen flex-col items-center">
              <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-2xl text-center">
                {user.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt={user.displayName ?? "User profile"}
                    className="w-32 h-32 rounded-full mx-auto mb-5"
                  />
                )}
                <h1 className="text-3xl font-bold mb-2">{user.displayName}</h1>
                <p className="text-gray-600 mb-4">@{user.username}</p>
                {/* {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>} */}
                <div className="flex justify-center gap-6 mt-4 text-gray-700">
                  {user.email && <span>Email: {user.email}</span>}
                  {user.phoneNumber && <span>Phone: {user.phoneNumber}</span>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default UserPage;
