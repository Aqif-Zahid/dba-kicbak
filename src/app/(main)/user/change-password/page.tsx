import { UserSettingsMain } from "@/components/user-settings/user-settings-main"
import { getServerSession } from "next-auth";
import { Unauthorized } from "@/components/admin/unauthorized";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ChangePasswordPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <Unauthorized />;
  }

  return (
    <section className="pb-20">
      <UserSettingsMain />
    </section>
  );
};

export default ChangePasswordPage;
