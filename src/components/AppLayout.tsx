import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

export function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 overflow-auto p-2 md:p-3">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
