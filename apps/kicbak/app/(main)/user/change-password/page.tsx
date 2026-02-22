import { getServerSessionFromApi } from "@/lib/server-session";
import { UserSettingsMain } from "@/components/user-settings/user-settings-main"
import { Unauthorized } from "@/components/admin/unauthorized";

const ChangePasswordPage = async () => {
  const session = await getServerSessionFromApi();
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
