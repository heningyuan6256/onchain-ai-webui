import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { UploadDataProvider } from "@/contexts/UploadDataContext";
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/layout/PageTransition";
import { Toaster } from "sonner";

export default function Layout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <UploadDataProvider>
        <div className="flex min-h-screen overflow-hidden w-full">
          <Toaster position="top-right"></Toaster>
          <AppSidebar />
          <div className="flex-1 relative overflow-hidden">
            {/* <AnimatePresence mode="wait" initial={false}>
              <PageTransition key={location.pathname}> */}
            <Outlet />
            {/* </PageTransition>
            </AnimatePresence> */}
          </div>
        </div>
      </UploadDataProvider>
    </SidebarProvider>
  );
}
