"use client";

import { useEffect, useRef, useState } from "react";
import { Coins } from "lucide-react";
import { useUserLedgerSummary } from "@/services/ledger/use-user-ledger-summary";
import { useUnclaimedRewards } from "@/services/rewards/use-unclaimed-rewards";

interface UserPointsBadgeProps {
  onClick?: () => void; // header-client passes this
}

export const UserPointsBadge = ({ onClick }: UserPointsBadgeProps) => {
  const { data, isLoading, refetch } = useUserLedgerSummary();
  const { data: rewardsData } = useUnclaimedRewards();

  // API returns { rewards, totalAmount }
  const unclaimedCount = rewardsData?.rewards?.length ?? 0;
  const hasUnclaimed = unclaimedCount > 0;

  const [displayPoints, setDisplayPoints] = useState<number>(0);
  const animationFrame = useRef<number | null>(null);

  // Track the latest value to avoid stale state bugs
  const latestPoints = useRef(0);
  useEffect(() => {
    latestPoints.current = displayPoints;
  }, [displayPoints]);

  // Sync initial points
  useEffect(() => {
    if (data?.balance != null) {
      setDisplayPoints(data.balance);
      latestPoints.current = data.balance;
    }
  }, [data]);

  // Animate changes when rewards claimed
  useEffect(() => {
    const handleClaimed = (e: Event) => {
      const evt = e as CustomEvent<number>;
      const increaseAmount = evt.detail;
      if (!increaseAmount) return;

      // Use the latest value, not stale state
      const start = latestPoints.current;
      const end = start + increaseAmount;

      const duration = 800;
      const startTime = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.round(start + (end - start) * progress);
        setDisplayPoints(current);

        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate);
        } else {
          refetch(); // Refresh final value from DB
        }
      };

      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener("points-claimed", handleClaimed);

    return () => {
      window.removeEventListener("points-claimed", handleClaimed);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [refetch]);

  const [isHovering, setIsHovering] = useState(false);

  if (isLoading || data == null) return null;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Pink chat-style tooltip BELOW the badge */}
      {hasUnclaimed && isHovering && (
        <div
          className="
            absolute left-1/2 top-full mt-3 -translate-x-1/2
            px-5 py-3 rounded-xl
            bg-pink-600 text-white text-sm
            shadow-xl z-50 whitespace-nowrap
            animate-fadeIn
          "
        >
          You have unclaimed rewards!
        </div>
      )}

      <button
        onClick={hasUnclaimed && onClick ? onClick : undefined}
        className={`
          flex items-center gap-1 font-semibold px-2 py-1 rounded-full transition-all

          ${hasUnclaimed ? "bg-pink-600 text-white shadow-lg" : "text-yellow-500"}

          ${hasUnclaimed ? "animate-wiggle animate-pulse-slow" : ""}

          hover:scale-110 active:scale-95
        `}
      >
        <Coins className="h-5 w-5" strokeWidth={2} />
        <span>{displayPoints}</span>
      </button>
    </div>
  );
};
