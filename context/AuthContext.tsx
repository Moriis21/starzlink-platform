"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";

interface InsForgeUser {
  id: string;
  email: string;
  emailVerified?: boolean;
  profile?: {
    name?: string;
    avatar_url?: string;
  };
}

interface Profile {
  full_name?: string;
  phone?: string;
  role: "user" | "admin" | "super_admin";
  user_type: string;
  profile_image?: string;
}

interface AppUser extends InsForgeUser {
  full_name: string;
  role: "user" | "admin" | "super_admin";
  user_type: string;
  profile_image?: string;
  phone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAdmin: false,
  isSuperAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (authUser: InsForgeUser) => {
    const { data: profile } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    setUser({
      ...authUser,
      full_name: (profile as Profile)?.full_name ?? authUser.profile?.name ?? authUser.email,
      role: (profile as Profile)?.role ?? "user",
      user_type: (profile as Profile)?.user_type ?? "student",
      profile_image: (profile as Profile)?.profile_image ?? authUser.profile?.avatar_url,
      phone: (profile as Profile)?.phone,
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) await loadUserProfile(data.user as InsForgeUser);
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      await loadUserProfile(data.user as InsForgeUser);

      // Upsert profile row on first login
      await insforge.database.from("profiles").upsert([{
        id: data.user.id,
        full_name: data.user.profile?.name ?? data.user.email,
      }], { onConflict: "id" });
    }
  };

  const logout = async () => {
    await insforge.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === "admin" || user?.role === "super_admin",
        isSuperAdmin: user?.role === "super_admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
