"use client";

import { useSession } from "next-auth/react";
import { TravelBenefits } from "@/components/home/traveler-benefits";
import { HeroSection } from "@/components/home/hero-section";
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
    <div>
      {isSignedIn && userStatus === "ACTIVE" ? (
        <></>
      ) : (
        <div className="w-full">
          <HeroSection />
          <TravelBenefits />
        </div>
      )}
    </div>
  );
}
