"use client";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useUser } from "@/providers/auth-provider";

const LogOutButton = () => {
  const { loading, logout } = useUser();

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3 hover:bg-primary hover:text-white mb-0 w-full"
      title="Log Out"
      onClick={logout}
    >
      <LogOut />
      {loading ? (
        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white ms-4"></span>
      ) : (
        <span className="hidden lg:inline">Log Out</span>
      )}
    </Button>
  );
};
export default LogOutButton;
