"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

type UserRole = "teacher" | "cashier";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  teacher?: {
    id: number;
    teacher_id?: string;
  };
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: "1",
    name: "John Doe",
    email: "john@coreskool.com",
    role: "teacher",
    avatar: "JD",
  });

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
