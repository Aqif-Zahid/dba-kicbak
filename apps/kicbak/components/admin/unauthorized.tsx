"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 px-4">
      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl p-10 md:p-16 text-center max-w-lg w-full"
      >
        {/* Animated Icon */}
        <motion.div
          className="flex justify-center mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg
            className="w-20 h-20 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M12 5a7 7 0 1 0 0 14a7 7 0 0 0 0-14z"
            />
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          401 - Unauthorized
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-600 mb-6"
        >
          Oops! You are not authorized to view this page. Please log in to
          continue.
        </motion.p>

        {/* Call-to-action button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
          >
            Go to Sign In
          </Link>
        </motion.div>
      </motion.div>

      {/* Optional footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-gray-400 mt-6"
      >
        If you believe this is a mistake, please contact support.
      </motion.p>
    </div>
  );
};
