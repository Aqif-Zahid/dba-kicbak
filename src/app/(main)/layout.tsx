import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/side-bar";
import { Footer } from "@/components/layout/footer";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";
import { SigninModal } from "@/components/auth/signin-modal";
import { RequestInviteCodeModal } from "@/components/auth/request-invite-code-modal";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col bg-background scroll-smooth">
      <div className="sticky top-0 z-40 bg-white">
        <Header user={session?.user} />
      </div>

      {/* Main content area */}
      <div className="container flex w-full grow gap-5 py-5">
        {/* Desktop sidebar */}
        <Sidebar
          user={session?.user}
          className="sticky top-[5.50rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80"
        />

        {/* Page content */}
        <main className="w-full">{children}</main>
      </div>

      {/* Mobile bottom sidebar */}
      <Sidebar
        user={session?.user}
        className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden"
      />

      <ScrollToTopButton />
      <Footer />
      <SigninModal />
      <RequestInviteCodeModal />
    </div>
  );
};

export default MainLayout;
