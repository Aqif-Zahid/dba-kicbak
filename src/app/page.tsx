"use client";

import { useSession } from "next-auth/react";
import { TravelBenefits } from "@/components/home/traveler-benefits";
import { HeroSection } from "@/components/home/hero-section";
import { Layout } from "@/components/layout/layout";
import { RecentPosts } from "@/components/home/recent-posts";

export default function HomePage() {
  const { data: session, status: authStatus } = useSession();

  const userStatus = (session?.user as any)?.status as
    | "WAITLISTED"
    | "PENDING"
    | "ACTIVE"
    | "BLOCKED"
    | undefined;

  const isSignedIn = authStatus === "authenticated";

  return (
    <Layout>
      <div className="p-6">
        {isSignedIn && userStatus === "ACTIVE" ? (
          <RecentPosts isSignedIn={isSignedIn} userStatus={userStatus} />
        ) : (
          <div className="w-full">
            <HeroSection />
            <TravelBenefits />
          </div>
        )}
      </div>
    </Layout>
  );
}
