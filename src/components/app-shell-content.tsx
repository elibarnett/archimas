"use client";

import { usePathname } from "next/navigation";
import { AppBottomNav } from "@/components/app-bottom-nav";

// Blueprint viewer pages manage their own full-screen layout and bottom nav
const FULL_SCREEN_PATTERN = /^\/projects\/[^/]+\/blueprints\/[^/]+$/;

export function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_PATTERN.test(pathname);

  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="pb-16 md:pb-0">{children}</div>
      <AppBottomNav />
    </>
  );
}
