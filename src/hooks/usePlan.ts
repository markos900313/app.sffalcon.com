"use client";

import { useOrganization } from "@/context/OrganizationContext";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export type PlanType = 'free' | 'pro';

export function usePlan() {
  const { organization, loading: contextLoading } = useOrganization();
  const [orgData, setOrgData] = useState<{
    plan: string;
    trial_ends_at: string | null;
    trial_used: boolean;
    created_at: string;
  } | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPlan() {
      if (contextLoading) return;
      if (!organization?.id) {
        setPlanLoading(false);
        return;
      }
      try {
        const { data: org } = await supabase
          .from('organizations')
          .select('plan, trial_ends_at, trial_used, created_at')
          .eq('id', organization.id)
          .single();

        if (org) {
          setOrgData({
            plan: org.plan || 'pro',
            trial_ends_at: org.trial_ends_at,
            trial_used: org.trial_used,
            created_at: org.created_at
          });
        }
      } catch (err) {
        // ignore
      } finally {
        setPlanLoading(false);
      }
    }
    loadPlan();
  }, [organization?.id, contextLoading]);

  const plan = useMemo((): PlanType => {
    if (!orgData) return 'pro';
    const rawPlan = orgData.plan?.trim().toLowerCase();
    if (rawPlan === 'free' || rawPlan === 'gratis') return 'free';
    return 'pro';
  }, [orgData]);

  const trialEndsAt = orgData?.trial_ends_at || null;

  const isTrialExpired = useMemo(() => {
    if (!trialEndsAt) return false;
    return new Date() > new Date(trialEndsAt);
  }, [trialEndsAt]);

  const hasAccess = (module: string): boolean => {
    if (plan === 'pro') return true;
    const freeModules = [
      'dashboard', 'communications', 'clients',
      'appointments', 'settings', 'catalog',
      'inventory', 'team', 'shifts'
    ];
    return freeModules.includes(module);
  };

  return {
    plan,
    trialEndsAt,
    createdAt: organization?.created_at || orgData?.created_at,
    isTrialExpired,
    hasAccess,
    loading: contextLoading || planLoading
  };
}

export function useTrialStats(
  trialEndsAt: string | null | undefined, 
  createdAt?: string | null
) {
  return useMemo(() => {
    if (!trialEndsAt) return { 
      daysLeft: 0, progress: 0, 
      color: '#94A3B8', bgColor: 'rgba(148,163,184,0.1)' 
    };

    const today = new Date();
    const trialEnd = new Date(trialEndsAt);
    const trialStart = createdAt 
      ? new Date(createdAt) 
      : new Date(trialEnd.getTime() - 90 * 24 * 60 * 60 * 1000);

    const totalDuration = Math.round(
      (trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceStart = Math.floor(
      (today.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysLeft = Math.max(0, totalDuration - daysSinceStart);
    const progress = Math.min(100, Math.max(0, (daysLeft / 90) * 100));

    let color = "#3B82F6";
    let bgColor = "rgba(59,130,246,0.1)";

    if (daysLeft <= 7) {
      color = "#EF4444";
      bgColor = "rgba(239,68,68,0.1)";
    }

    return { daysLeft, progress, color, bgColor };
  }, [trialEndsAt, createdAt]);
}
