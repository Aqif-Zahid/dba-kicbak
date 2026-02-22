"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

interface PollSectionProps {
  postId: number;
  isAuthor?: boolean;
}

interface PollOption {
  id: number;
  text: string;
  voteCount: number;
  votedByUser: boolean;
  percentage: number;
}

export const PollSection = ({ postId }: PollSectionProps) => {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const lastUpdatedRef = useRef<number>(Date.now());

  const { data, isLoading } = useQuery({
    queryKey: ["poll", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/polls/${postId}`, { cache: "no-store" });
      const json = await res.json();
      if (json.status === 0) throw new Error(json.message);
      return json.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 15000,
  });

  const voteMutation = useMutation({
    mutationFn: async (pollOptionId: number) => {
      const res = await fetch("/api/posts/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollOptionId }),
      });
      const json = await res.json();
      if (json.status === 0) throw new Error(json.message);
      return json.data;
    },
    onMutate: async (pollOptionId: number) => {
      await queryClient.cancelQueries({ queryKey: ["poll", postId] });
      const prevData = queryClient.getQueryData<any>(["poll", postId]);
      if (!prevData) return { prevData };

      const allowMultiple =
        Boolean(prevData.allowMultiple) ||
        Boolean((prevData as any).allow_multiple) ||
        (typeof (prevData as any).maxSelections === "number" &&
          (prevData as any).maxSelections > 1);

      const updatedOptions = allowMultiple
        ? prevData.options.map((opt: any) =>
            opt.id === pollOptionId
              ? {
                  ...opt,
                  votedByUser: !opt.votedByUser,
                  voteCount: opt.voteCount + (opt.votedByUser ? -1 : 1),
                }
              : opt
          )
        : prevData.options.map((opt: any) => {
            if (opt.id === pollOptionId) {
              return opt.votedByUser
                ? { ...opt, votedByUser: false, voteCount: Math.max(0, opt.voteCount - 1) }
                : { ...opt, votedByUser: true, voteCount: opt.voteCount + 1 };
            }
            return opt.votedByUser
              ? { ...opt, votedByUser: false, voteCount: Math.max(0, opt.voteCount - 1) }
              : opt;
          });

      queryClient.setQueryData(["poll", postId], { ...prevData, options: updatedOptions });
      return { prevData };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevData) queryClient.setQueryData(["poll", postId], ctx.prevData);
      toast.error("Vote failed — please try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["poll", postId] }),
  });

  useEffect(() => {
    if (!data || data.isClosed || !("expiresAt" in data)) return;
    const expiresAt = new Date(data.expiresAt).getTime();
    const updateTime = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("Poll ended");
        queryClient.invalidateQueries({ queryKey: ["poll", postId] });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [data, queryClient, postId]);

  useEffect(() => {
    const evtSource = new EventSource("/api/stream/polls");
    evtSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.pollId === postId) {
          const now = Date.now();
          if (now - lastUpdatedRef.current > 1500) toast.info("Poll updated in real time");
          queryClient.invalidateQueries({
            predicate: (q) => q.queryKey[0] === "poll" && q.queryKey[1] === payload.pollId,
          });
        }
      } catch {}
    };
    evtSource.onerror = () => evtSource.close();
    return () => evtSource.close();
  }, [postId, queryClient]);

  if (isLoading) return <p>Loading poll...</p>;
  if (!data) return null;

  const poll = data;
  const canVote = !poll.isClosed;

  const allowMultiple: boolean =
    Boolean(poll.allowMultiple) ||
    Boolean((poll as any).allow_multiple) ||
    (typeof (poll as any).maxSelections === "number" && (poll as any).maxSelections > 1);

  const gradients = [
    "linear-gradient(90deg, #ec4899, #db2777, #ec4899)",
    "linear-gradient(90deg, #a855f7, #7e22ce, #a855f7)",
    "linear-gradient(90deg, #f43f5e, #be123c, #f43f5e)",
    "linear-gradient(90deg, #f59e0b, #d97706, #f59e0b)",
    "linear-gradient(90deg, #6366f1, #4338ca, #6366f1)",
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <style jsx>{`
        @keyframes shimmerMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <Card className="p-4 space-y-3 rounded-2xl shadow-sm border relative overflow-hidden">
        {/* Status */}
        <div className="absolute top-3 right-3 text-right text-xs leading-tight">
          {poll.isClosed ? (
            <span className="block text-destructive font-bold flex items-center gap-1">
              <Lock className="size-3" />
              Poll Closed
            </span>
          ) : (
            <>
              <span className="block text-destructive font-bold mb-1">LIVE</span>
              <span className="text-gray-600">{timeLeft}</span>
            </>
          )}
        </div>

        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Poll</h3>
        </div>

        <CardContent className="space-y-3">
          {poll.options.map((opt: PollOption, idx: number) => (
            <div key={opt.id} className="space-y-2">
              <Button
                variant={opt.votedByUser ? "default" : "outline"}
                disabled={!canVote}
                onClick={() => voteMutation.mutate(opt.id)}
                className={`w-full justify-between transition-all duration-200 ${
                  opt.votedByUser
                    ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-md scale-[1.02]"
                    : "hover:bg-pink-50"
                }`}
              >
                <span>{opt.text}</span>
                {poll.canViewResults && (
                  <span className={`text-sm font-semibold ${opt.votedByUser ? "text-white" : "text-black"}`}>
                    {opt.voteCount}
                  </span>
                )}
              </Button>

              <AnimatePresence>
                {poll.canViewResults && (
                  <motion.div
                    key={`progress-${opt.id}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${opt.percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <div className="h-2 w-full rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${opt.percentage}%`,
                          background: poll.isClosed
                            ? gradients[idx % gradients.length].replace(/#([0-9a-fA-F]{6})/g, "#aaa")
                            : gradients[idx % gradients.length],
                          backgroundSize: poll.isClosed ? "100% 100%" : "200% 200%",
                          animation: poll.isClosed ? "none" : "shimmerMove 3s linear infinite",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <div className="text-center space-y-1 mt-2">
            {!poll.isClosed && allowMultiple && (
              <motion.p
                key="multiVotes"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] font-medium text-pink-600"
              >
                You can vote for multiple options
              </motion.p>
            )}

            {poll.canViewResults && (
              <motion.p
                key="totalVotes"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-gray-800 font-semibold"
              >
                Total votes: {poll.totalVotes}
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
