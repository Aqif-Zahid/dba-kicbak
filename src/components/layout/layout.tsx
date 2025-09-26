"use client";
import React, { useEffect, useState } from "react";
import { FiChevronUp } from "react-icons/fi";
import { motion } from "framer-motion";
import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);

  // Show "Go to Top" button after scrolling down 300px
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <main className="min-h-screen flex flex-col justify-between bg-background scroll-smooth">
      <Header />
      {children}
      {showScrollToTop && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed cursor-pointer bottom-6 right-6 bg-primary hover:bg-gray-900 text-white p-3 rounded-full shadow-lg z-50"
          aria-label="Scroll to top"
        >
          <FiChevronUp />
        </motion.button>
      )}

      <Footer />
    </main>
  );
};
