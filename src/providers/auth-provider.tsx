"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, signOut } from "next-auth/react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email!,
        name: session.user.name ?? undefined,
        role: (session.user as any).role,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const logout = () => signOut();

  return (
    <UserContext.Provider
      value={{ user, loading: status === "loading", logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easier access
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
