import { ProfileMain } from "@/components/admin/profile/profile-main";
import { getServerSession } from "next-auth";
import { Unauthorized } from "@/components/admin/unauthorized";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <Unauthorized />;
  }
  const user = session?.user;
  return <ProfileMain user={user} />;
};

export default AdminPage;
