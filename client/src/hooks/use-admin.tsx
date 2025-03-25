import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

type AdminContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
};

export const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const {
    data: adminData,
    error,
    isLoading,
  } = useQuery<{ isAdmin: boolean }, Error>({
    queryKey: ["/api/check-admin"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Only run this query if user is logged in
    enabled: !!user,
  });

  return (
    <AdminContext.Provider
      value={{
        isAdmin: !!adminData?.isAdmin,
        isLoading,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}