import Head from "next/head";

import { Sidebar } from "@/components/admin/sidebar";
import { ProfileMain } from "@/components/admin/profile/profile-main";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Unauthorized } from "@/components/admin/unauthorized";

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <Unauthorized />;
  }
  const user = session?.user;
  return (
    <>
      <Head>
        <title>My Profile</title>
      </Head>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="flex min-h-screen flex-col">
            <div className="max-w-7xl mx-auto p-5 flex w-full grow gap-5">
              <Sidebar className="sticky top-[5.50rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80" />
              {/* Pass user info to ProfileMain */}
              {user && <ProfileMain user={user} />}
            </div>
            <Sidebar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminPage;
