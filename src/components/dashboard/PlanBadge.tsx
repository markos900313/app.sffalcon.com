"use client";

import { useOrganization } from "@/context/OrganizationContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PlanBadge = () => {
  const { organization } = useOrganization();
  
  const planColors = {
    starter: 'bg-slate-500',
    pro: 'bg-blue-500',
    ultra: 'bg-purple-500'
  } as const;

  const currentPlan = (organization?.plan?.toLowerCase() || 'starter') as keyof typeof planColors;

  return (
    <div className="flex-shrink-0 inline-flex items-center gap-1 ml-auto">
      <span className={cn(
        "text-[7px] font-black px-1.5 py-0.5 rounded-md text-white shadow-sm flex-shrink-0",
        planColors[currentPlan] || planColors.starter
      )}>
        {currentPlan}
      </span>
      {currentPlan !== 'ultra' && (
        <Link href="/dashboard/settings" className="text-[8px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0 whitespace-nowrap">
          +
        </Link>
      )}
    </div>
  );
};

export default PlanBadge;
