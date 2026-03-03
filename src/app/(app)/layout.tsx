import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppShellContent } from "@/components/app-shell-content";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="hidden md:contents">
          <AppSidebar />
        </div>
        <SidebarInset>
          <AppShellContent>{children}</AppShellContent>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
