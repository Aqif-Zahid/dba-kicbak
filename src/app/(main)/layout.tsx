import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/home/side-bar";
import { Footer } from "@/components/layout/footer";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="min-h-screen flex flex-col justify-between bg-background scroll-smooth">
        <Header />
        <div className="max-w-7xl mx-auto py-5 flex w-full grow gap-5">
          <Sidebar
            user={session?.user}
            className="sticky top-[5.50rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80"
          />
          {children}
        </div>
        <Sidebar
          user={session?.user}
          className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden"
        />
        <ScrollToTopButton />
        <Footer />
      </main>
    </div>
  );
};
export default MainLayout;
