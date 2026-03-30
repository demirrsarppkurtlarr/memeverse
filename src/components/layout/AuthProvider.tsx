"use client";

import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";

function AuthInit() {
  useAuth();   // initializes auth state globally
  useLikes();  // seeds like/favourite cache after auth resolves
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInit />
      {children}
    </>
  );
}
