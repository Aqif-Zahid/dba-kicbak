"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import Loader from "@/components/common/loader";
import PageError from "@/components/common/error-page";
import { getErrorMessage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function ConfigureRewardsPage() {
  const [referrerPoints, setReferrerPoints] = useState<number>(0);
  const [referredPoints, setReferredPoints] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/admin/rewards");
        if (res.data.status === 1) {
          setReferrerPoints(res.data.data.referrer_reward_points);
          setReferredPoints(res.data.data.referred_reward_points);
          setLastUpdated(res.data.data.lastUpdated);
        } else {
          setError(res.data.message);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const res = await axios.post("/api/admin/rewards", {
        referrer_reward_points: referrerPoints,
        referred_reward_points: referredPoints,
      });

      if (res.data.status === 1) {
        toast.success("Reward settings updated successfully");
        setLastUpdated(new Date().toISOString());
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;
  if (error) return <PageError message={error} />;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold text-center">Configure Rewards</h1>

      <div className="space-y-4">
        <div>
          <label className="font-semibold">Referrer Reward Points</label>
          <Input
            type="number"
            min={0}
            value={referrerPoints}
            onChange={(e) => setReferrerPoints(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="font-semibold">Referred User Reward Points</label>
          <Input
            type="number"
            min={0}
            value={referredPoints}
            onChange={(e) => setReferredPoints(Number(e.target.value))}
          />
        </div>

        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated on: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
