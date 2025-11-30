"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { InfiniteScrollContainer } from "@/components/infinite-scroll-container";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LedgerTransaction = {
  id: string;
  deltaPoints: number;
  transactionType: "DEBIT" | "CREDIT";
  reason: string;
  createdAt: string;
};

type LedgerPage = {
  transactions: LedgerTransaction[];
  totalCount: number;
  page: number;
  limit: number;
};

export const LedgerList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    status,
  } = useInfiniteQuery({
    queryKey: ["user-ledger-history"],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get("/api/ledger/transactions", {
        params: {
          page: pageParam || 1,
          limit: 20,
        },
      });

      if (res.data.status === 0) {
        throw new Error(res.data.message || "Failed to fetch ledger history");
      }

      return res.data.data as LedgerPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, totalCount } = lastPage;
      const reachedEnd = page * limit >= totalCount;
      return reachedEnd ? undefined : page + 1;
    },
  });

  const transactions =
    data?.pages.flatMap((page) => page.transactions) || [];

  if (status === "pending") {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-destructive py-8">
        Failed to load transaction history.
      </div>
    );
  }

  if (status === "success" && !transactions.length && !hasNextPage) {
    return (
      <div className="text-center text-muted-foreground py-8">
        You don&apos;t have any transactions yet.
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-4"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {transactions.map((item) => {
        const isCredit = item.transactionType === "CREDIT";

        const createdAt = new Date(item.createdAt);
        const formattedTime = createdAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedDate = createdAt.toLocaleDateString("en-BD", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Make enum-like reasons more readable
        const readableReason = item.reason
          ?.toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

        return (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm"
          >
            {/* Left side: title + meta */}
            <div className="flex items-center gap-3">
              {/* Avatar-like circle */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {isCredit ? "+" : "-"}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {readableReason || "Transaction"}
                </p>

                <p className="text-xs text-muted-foreground">
                  TrxID: {item.id}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formattedTime} • {formattedDate}
                </p>
              </div>
            </div>

            {/* Right side: amount */}
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isCredit ? "text-green-600" : "text-red-600"
                )}
              >
                {isCredit ? "+" : "-"}
                {item.deltaPoints} pts
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                {isCredit ? "Added to balance" : "Spent from balance"}
              </p>
            </div>
          </div>
        );
      })}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </InfiniteScrollContainer>
  );
};
