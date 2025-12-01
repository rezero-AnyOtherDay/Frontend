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
    <div className="w-full min-h-dvh flex flex-col max-w-md mx-auto bg-background">
      {/* Header */}
      {hasHeader && headerContent && (
        <header className="sticky top-0 z-40 bg-background shrink-0">
          {headerContent}
        </header>
      )}

      {/* Main Content - scrollable area with optional bottom padding for navigation */}
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden ${
          showNavigation ? "pb-20" : "pb-0"
        }`}
      >
        {children}
      </main>

      {/* Bottom Navigation - fixed at bottom */}
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
