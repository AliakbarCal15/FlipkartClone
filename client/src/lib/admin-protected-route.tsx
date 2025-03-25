import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function AdminProtectedRoute({
  path,
  component,
}: {
  path: string;
  component: React.ComponentType;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  
  const isLoading = authLoading || adminLoading;

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#2874f0]" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : !isAdmin ? (
        <Redirect to="/" />
      ) : (
        React.createElement(component)
      )}
    </Route>
  );
}