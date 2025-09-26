"use client";
import axios from "axios";
import { useState } from "react";
import { SignupModal } from "../auth/signup-modal";
import { motion } from "framer-motion";
interface ClaimUsernameProps {
  referralCode: string;
}

export const ClaimUsername = ({ referralCode }: ClaimUsernameProps) => {
  // Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const [showSignup, setShowSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidLength, setIsValidLength] = useState(false);

  const checkUsername = async () => {
    if (!username.trim() || username.length < 4) return;
    setIsChecking(true);
    try {
      const res = await axios.get(`/api/check-username?username=${username}`);
      if (res.data.status === 1) {
        setIsAvailable(true);
      } else {
        setError(res.data.message);
      }
      setIsChecking(false);
    } catch (e) {
      setIsChecking(false);
      setError("Something went wrong");
      console.log(e);
    }
  };

  const handleClaimUsername = () => {
    if (isAvailable && username.length >= 4) {
      setShowSignUp(true);
    }
  };
  return (
    <div>
      {showSignup && (
        <SignupModal
          show={showSignup}
          setShow={setShowSignUp}
          username={username}
          referralCode={referralCode}
        />
      )}
      <motion.div className="max-w-md mx-auto space-y-12" variants={fadeUp}>
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
                  setIsAvailable(false);
                }}
                className="w-full pl-8 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none ring-2 ring-primary focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <button
              onClick={checkUsername}
              disabled={!isValidLength || isChecking}
              className={`w-[220px] px-6 py-[12px] bg-primary text-primary-foreground rounded-lg font-semibold text-nowrap transition-all duration-200 hover:bg-primary/90 hover:scale-105 cursor-pointer ${
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
        {isAvailable && (
          <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
            @{username} is available! 🎉
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
        {isAvailable && (
          <button
            onClick={handleClaimUsername}
            className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Claim @{username}
          </button>
        )}
      </motion.div>
    </div>
  );
};
export default ClaimUsername;
