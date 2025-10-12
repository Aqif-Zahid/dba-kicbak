import { getServerSession } from "next-auth";
import { Unauthorized } from "@/components/admin/unauthorized";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ProfilesPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <Unauthorized />;
  }

  return (
    <section className="pb-20">
      <p>Profiles Page</p>
    </section>
  );
};

export default ProfilesPage;
