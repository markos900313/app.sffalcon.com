import React from "react";
import { cn } from "@/lib/utils";

interface DashboardPageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

/**
 * Standard container for dashboard pages.
 * Follows the benchmark of the home page: edge-to-edge relative to the layout's main padding.
 */
export function DashboardPageContainer({ 
  children, 
  className,
  animate = false 
}: DashboardPageContainerProps) {
  return (
    <div className={cn(
      "flex flex-col gap-6 w-full max-w-full text-[var(--text-primary)] overflow-x-hidden pb-32",
      animate && "animate-in fade-in duration-700",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Standard section for dashboard pages that requires extra horizontal padding.
 * Matches the home page header indentation.
 */
export function DashboardSection({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn("px-4 md:px-8", className)}>
      {children}
    </div>
  );
}
