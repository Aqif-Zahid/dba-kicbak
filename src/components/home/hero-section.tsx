"use client";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { motion } from "framer-motion";
import { useUser } from "@/providers/auth-provider";
import { useRequestInviteModal } from "@/hooks/use-request-invite-modal";

export const HeroSection = () => {
  const { user } = useUser();
  const isSignedIn = user ? true : false;
  const { open } = useSigninModal();
  const { open: openInviteCodeModal } = useRequestInviteModal();
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
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.displayName}!
            </h1>
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
              <h1 className="text-5xl md:text-4xl lg:text-6xl text-foreground">
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
              <button
                onClick={openInviteCodeModal}
                className={`px-6 py-[12px] bg-primary text-primary-foreground rounded-lg font-semibold text-nowrap transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer ${"animate-pulse shadow-lg shadow-primary/25"}`}
              >
                Request An Invite
              </button>
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
