"use client";

import BottomNavigation from "@/components/navigation/BottomNavigation";
import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  hasHeader?: boolean;
  headerContent?: React.ReactNode;
  showNavigation?: boolean;
}

export default function AppLayout({
  children,
  hasHeader = false,
  headerContent = null,
  showNavigation = true,
}: AppLayoutProps) {
  return (
    <div className="w-full h-screen flex flex-col max-w-md mx-auto bg-background">
      {/* Header */}
      {hasHeader && headerContent && (
        <header className="sticky top-0 z-40 bg-background shrink-0">
          {headerContent}
        </header>
      )}

      {/* Main Content - scrollable area with bottom padding for navigation */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        {children}
      </main>

      {/* Bottom Navigation - fixed at bottom */}
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
