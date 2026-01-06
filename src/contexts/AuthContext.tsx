"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentUser,
  useLogin as useLoginMutation,
  useLogout as useLogoutMutation,
  useSignup as useSignupMutation,
} from "@/hooks/useApi";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  phoneNumber?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  profileImage?: string;
  planType?: "free" | "monthly" | "yearly";
  menusLimit?: number;
  currentMenusCount?: number;
  emailVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (
    email: string,
    password: string,
    name: string,
    phoneNumber: string
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const logoutMutation = useLogoutMutation();

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });

      // Return user data for redirect logic
      return result;
    } catch (error) {
      console.error("❌ Login error:", error);
      // Error is already handled by the mutation
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    phoneNumber: string
  ): Promise<boolean> => {
    try {
      console.log("📝 Starting signup...");
      await signupMutation.mutateAsync({ email, password, name, phoneNumber });
      console.log("✅ Signup successful");
      return true;
    } catch (error) {
      console.error("❌ Signup error:", error);
      // Error toast is already shown by the mutation
      return false;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const value: AuthContextType = {
    user: user || null,
    loading: isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
