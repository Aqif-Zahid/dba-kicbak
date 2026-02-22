import { redirect } from "next/navigation";
import { getSiteVariant } from "@/lib/site-variant";

export default async function RootHomePage() {
  const variant = getSiteVariant();

  if (variant === "DBA") {
    return (
      <iframe
        title="Direct Booking Alliance"
        src="/dba-shell"
        style={{
          width: "100%",
          height: "100vh",
          border: "0",
          display: "block",
        }}
      />
    );
  }

  redirect("/home");
}
