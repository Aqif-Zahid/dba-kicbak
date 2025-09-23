"use client";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { useSignupModal } from "@/hooks/use-signup-modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/providers/auth-provider";

export const HeroSection = () => {
  const { user } = useUser();
  const isSignedIn = user ? true : false;

  const { open } = useSigninModal();
  const { open: openSignup } = useSignupModal();

  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isValidLength, setIsValidLength] = useState(false);

  const checkUsername = async () => {
    if (!username.trim() || username.length < 4) return;

    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAvailable(Math.random() > 0.3);
    setIsChecking(false);
  };

  const handleClaimUsername = () => {
    if (isAvailable && username.length >= 4) {
      openSignup();
    }
  };

  // Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeUpStagger = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  return (
    <section>
      {isSignedIn ? (
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">
              Your Kicbak account is ready to go.
            </p>
          </div>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-12">
          <motion.div
            className="max-w-full mx-auto text-center space-y-16"
            initial="hidden"
            animate="visible"
            variants={fadeUpStagger}
          >
            <motion.div className="space-y-12" variants={fadeUp}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-foreground">
                Kicbak cuts out the travel middlemen.
                <br />
                Now, you get their commission.
              </h1>
              <p className="max-w-4xl mx-auto text-lg sm:text-xl lg:text-xl text-muted-foreground">
                Kicbak™ is a peer-to-peer travel ecosystem where everyone is
                rewarded when travelers book direct. Unlike extractive
                middlemen, we kick 100% of the commissions back to you, the
                members.
              </p>
            </motion.div>

            <motion.div
              className="max-w-md mx-auto space-y-12"
              variants={fadeUp}
            >
              <div className="flex gap-2">
                <div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => {
                        const newUsername = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "");
                        setUsername(newUsername);
                        setIsValidLength(newUsername.length >= 4);
                        setIsAvailable(null);
                      }}
                      className="w-full pl-8 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none ring-2 ring-primary focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <button
                    onClick={checkUsername}
                    disabled={!isValidLength || isChecking}
                    className={`px-6 py-[12px] bg-primary text-primary-foreground rounded-lg font-semibold text-nowrap transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer ${
                      username.trim() && isValidLength
                        ? "animate-pulse shadow-lg shadow-primary/25"
                        : ""
                    }`}
                  >
                    {isChecking ? "Checking..." : "Claim Your Username"}
                  </button>
                  <div className="text-muted-foreground text-sm mt-1">
                    (before someone else does)
                  </div>
                </div>
              </div>

              {username.length > 0 && username.length < 4 && (
                <div className="p-3 rounded-lg text-sm bg-yellow-50 text-yellow-700 border border-yellow-200">
                  Username must be at least 4 characters long
                </div>
              )}

              {isAvailable !== null && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    isAvailable
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {isAvailable
                    ? `@${username} is available! 🎉`
                    : `@${username} is already taken. Try another one.`}
                </div>
              )}

              {isAvailable && (
                <button
                  onClick={handleClaimUsername}
                  data-clerk-sign-up
                  className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Claim @{username}
                </button>
              )}
            </motion.div>

            <motion.div
              className="text-sm text-muted-foreground"
              variants={fadeUp}
            >
              Already have an account?
              <button className="text-primary hover:underline" onClick={open}>
                Sign in here
              </button>
            </motion.div>
          </motion.div>
        </main>
      )}
    </section>
  );
};
