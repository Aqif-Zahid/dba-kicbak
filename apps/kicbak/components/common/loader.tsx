"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      {/* Icon Animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        className="p-4 border-4 border-primary border-t-transparent rounded-full w-16 h-16 flex items-center justify-center"
      >
        <Sparkles className="w-6 h-6 text-primary" />
      </motion.div>

      {/* Brand Text Animation */}
      <motion.h1
        className="mt-6 text-2xl font-semibold text-primary tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Kicbak
      </motion.h1>

      {/* Optional subtle tagline */}
      <motion.p
        className="mt-2 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading your experience...
      </motion.p>
    </div>
  );
}
