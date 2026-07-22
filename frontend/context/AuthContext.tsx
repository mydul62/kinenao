"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface UserProfile {
  fullName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
}

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
    } catch (error) {
      console.error("Session restoration failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      setUser(data.data.user);

      // Redirect depending on user role
      if (data.data.user.role === "ADMIN" || data.data.user.role === "MANAGER") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      setIsLoading(false);
      const errors = error.response?.data?.errors;
      const errMsg = errors && Array.isArray(errors)
        ? errors.map((e: any) => e.message).join(" | ")
        : error.response?.data?.message || "Login failed";
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (regData: any) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/register", regData);
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      setUser(data.data.user);
      router.push("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      const errors = error.response?.data?.errors;
      const errMsg = errors && Array.isArray(errors)
        ? errors.map((e: any) => e.message).join(" | ")
        : error.response?.data?.message || "Registration failed";
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/login");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
