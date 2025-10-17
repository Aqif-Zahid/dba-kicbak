"use client";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { motion } from "framer-motion";
import ClaimUsername from "./claim-username";
interface InvitationMainProps {
  referralCode: string;
  email: string;
}

export const InvitationMain = ({
  referralCode,
  email,
}: InvitationMainProps) => {
  const { open } = useSigninModal();

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
      <main className="mx-auto px-4 py-12">
        <motion.div
          className="max-w-full mx-auto text-center space-y-16"
          initial="hidden"
          animate="visible"
          variants={fadeUpStagger}
        >
          <motion.div className="space-y-12" variants={fadeUp}>
            <h1 className="text-2xl md:text-3xl lg:text-5xl text-foreground">
              Kicbak cuts out the travel middlemen.
              <br />
              Now, you get their commission.
            </h1>
            <p className="max-w-4xl mx-auto text-lg sm:text-xl lg:text-xl text-muted-foreground">
              Kicbak™ is a peer-to-peer travel ecosystem where everyone is
              rewarded when travelers book direct. Unlike extractive middlemen,
              we kick 100% of the commissions back to you, the members.
            </p>
          </motion.div>
          <motion.div className="max-w-md mx-auto space-y-12" variants={fadeUp}>
            <ClaimUsername referralCode={referralCode} email={email} />
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
    </section>
  );
};
