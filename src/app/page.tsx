
"use client";

import { useSession } from "next-auth/react";
import { TravelBenefits } from "@/components/home/traveler-benefits";
import { HeroSection } from "../components/home/hero-section";
import { Layout } from "@/components/layout/layout";
import { Sidebar } from "@/components/home/side-bar";
// Import the modal component
import { ProfileCompletionModal } from "@/components/modals/profile-completion-modal";

export default function HomePage() {
  const { data: session, status: authStatus } = useSession();

  // Get user status from the session (ACTIVE, PENDING, etc.)
  const userStatus = session?.user?.status;
  const isSignedIn = authStatus === "authenticated";
  const isLoading = authStatus === "loading";

  // 1. Show loading state while NextAuth initializes
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // 2. FOR PENDING USERS (Waitlisted/Google Sign-in, no profile)
  // Force them to complete their profile before accessing the app.
  if (isSignedIn && userStatus === "PENDING") {
    // FIX: Render the modal with required props (isOpen=true for mandatory display)
    return <ProfileCompletionModal isOpen={true} onClose={() => {}} />;
  }

  // 3. FOR SIGNED-IN & ACTIVE USERS
  // Display the main application layout with the sidebar and discussion feed.
  if (isSignedIn && userStatus === "ACTIVE") {
    return (
      <Layout>
        <div className="flex w-full min-h-[calc(100vh-64px)]">
          {/* Sidebar is permanently visible on desktop */}
          <div className="hidden lg:block w-[280px] border-r border-gray-200 sticky top-0 h-full">
            <Sidebar />
          </div>
          {/* Discussion Feed */}
          
        </div>
      </Layout>
    );
  }

  // 4. FOR SIGNED-OUT USERS 
  // Display the public landing page content.
  return (
    <Layout>
      <HeroSection />
      <TravelBenefits />
    </Layout>
  );
}
