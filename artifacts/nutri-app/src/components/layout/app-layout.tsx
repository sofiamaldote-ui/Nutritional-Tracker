import { LayoutContext } from "@/lib/constants";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <LayoutContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-secondary/30">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
