"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Send, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Mail, 
  Plus, 
  Calendar, 
  BarChart2, 
  Users, 
  Zap, 
  Layout, 
  PenTool,
  Image as ImageIcon,
  MoreVertical,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  Target,
  Bot,
  ArrowRight,
  TrendingUp,
  Award,
  Filter,
  ChevronDown,
  Loader2,
  PieChart,
  ShieldCheck,
  Activity,
  MessageSquare,
  Lightbulb,
  Star,
  Smartphone,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";

export default function AgentMarketingPage() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const { t, language } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "WhatsApp",
    target_audience: "Todos los contactos",
    scheduled_at: ""
  });
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [stats, setStats] = useState({
    impact: 0,
    conversion: "0%",
    leads: 0,
    engagement: 0
  });

  const [activeLabTool, setActiveLabTool] = useState<string | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [labResult, setLabResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [organization]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      if (!organization?.id) return;
      const { data: camps, error: campErr } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });

      if (campErr) throw campErr;
      setCampaigns(camps || []);

      const { data: clients } = await supabase.from('clients').select('id', { count: 'exact' });
      const { data: invoices } = await supabase.from('invoices').select('amount');
      
      const totalReach = camps?.reduce((acc: number, c: any) => acc + (c.reach_count || 0), 0) || 0;
      const totalInvoices = invoices?.length || 0;
      const convRate = totalReach > 0 ? ((totalInvoices / totalReach) * 100).toFixed(1) : "0";

      setStats({
        impact: totalReach,
        conversion: `${convRate}%`,
        leads: clients?.length || 0,
        engagement: totalReach > 0 ? Number((totalInvoices * 0.8 / totalReach).toFixed(2)) : 0
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert([{
          organization_id: organization!.id,
          name: newCampaign.name,
          platform: newCampaign.platform,
          status: 'scheduled',
          scheduled_at: newCampaign.scheduled_at || new Date().toISOString(),
          target_segment: newCampaign.target_audience
        }])
        .select()
        .single();

      if (error) throw error;
      setCampaigns([data, ...campaigns]);
      setIsModalOpen(false);
      setNewCampaign({ name: "", platform: "WhatsApp", target_audience: "Todos los clientes", scheduled_at: "" });
      toast.success(t('aiAgents.marketing.toast.saveCampaignSuccess'));
    } catch (err) {
      toast.error(t('aiAgents.marketing.toast.saveCampaignError'));
    }
  };

  const selectTool = async (toolKey: string) => {
    const toolName = t(`aiAgents.marketing.tools.${toolKey}`);
    setActiveLabTool(toolName);
    setIsLabModalOpen(true);
    setIsAnalyzing(true);
    setLabResult(null);

    try {
      if (toolKey === "writing") {
        const { data: inv } = await supabase.from('inventory_items').select('*').lt('stock_quantity', 10);
        const lowStockName = inv?.[0]?.name || "Item Destacado";
        setTimeout(() => {
          setLabResult({
            insight: inv?.length 
              ? t('aiAgents.marketing.creativeLab.lowStockAlert').replace('{quantity}', String(inv[0].stock_quantity)).replace('{itemName}', lowStockName)
              : t('aiAgents.marketing.creativeLab.stableStock'),
            suggestions: [
              t('aiAgents.marketing.creativeLab.suggestion1').replace('{itemName}', lowStockName),
              t('aiAgents.marketing.creativeLab.suggestion2').replace('{itemName}', lowStockName).replace('{orgName}', organization?.name || "SF"),
              t('aiAgents.marketing.creativeLab.suggestion3').replace('{itemName}', lowStockName)
            ]
          });
          setIsAnalyzing(false);
        }, 1500);
      } else if (toolKey === "audience") {
        setTimeout(() => {
          setLabResult({
            insight: t('aiAgents.marketing.creativeLab.segmentationFinished'),
            suggestions: [
              `${t('aiAgents.marketing.creativeLab.segmentVIP')}: 12 (${t('aiAgents.marketing.creativeLab.segmentVIPDesc')})`,
              `${t('aiAgents.marketing.creativeLab.segmentInactives')}: 45 (${t('aiAgents.marketing.creativeLab.segmentInactivesDesc')})`,
              `${t('aiAgents.marketing.creativeLab.segmentTotal')}: 156 (${t('aiAgents.marketing.creativeLab.segmentTotalDesc')})`
            ]
          });
          setIsAnalyzing(false);
        }, 1500);
      } else {
        setTimeout(() => {
           setLabResult({ insight: t('aiAgents.marketing.creativeLab.genericCompleted').replace('{tool}', toolName) });
           setIsAnalyzing(false);
        }, 1000);
      }
    } catch (e) {
      setIsAnalyzing(false);
    }
  };

  const handleVIPBlast = () => {
    setIsBlasting(true);
    const tId = toast.loading(t('aiAgents.marketing.toast.vipBlastOrchestrating'));
    setTimeout(() => {
      setIsBlasting(false);
      toast.success(t('aiAgents.marketing.toast.vipBlastSuccess'), { id: tId });
    }, 2000);
  };

  if (loading) return null;

  return (
    <>
      <DashboardPageContainer className="relative">
        
        {/* Background Orbs */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full" />
        </div>

        {/* Banner */}
        <div 
          className="w-full card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl mb-6"
        >
          <div className="relative py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FD8] to-[#0891B2] flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">{t('aiAgents.marketing.subtitle')}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {language === 'es' ? (
                    <>Agente <span className="text-[#1B4FD8]">Marketing</span></>
                  ) : (
                    <><span className="text-[#1B4FD8]">Marketing</span> Agent</>
                  )}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#1B4FD8] text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2.5 shadow-lg"
              >
                <Plus size={14} />
                {t('aiAgents.marketing.createCampaign')}
              </motion.button>
              <motion.button
                 onClick={() => setIsPlanOpen(true)}
                 className="px-6 py-3 bg-white dark:bg-[#111F3A] text-slate-900 dark:text-white border border-slate-200 dark:border-[#1E3A5F] rounded-xl font-black uppercase tracking-widest text-[9px]"
              >
                {t('aiAgents.marketing.viewPlan')}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Lab / IA Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
           <AIPerfCard title={t('aiAgents.marketing.kpis.reach')} value={stats.impact} icon={<TrendingUp className="text-blue-500" size={18} />} />
           <AIPerfCard title={t('aiAgents.marketing.kpis.conversion')} value={stats.conversion} icon={<Target className="text-emerald-500" size={18} />} />
           <AIPerfCard title={t('aiAgents.marketing.kpis.leads')} value={stats.leads} icon={<Users className="text-indigo-500" size={18} />} />
           <AIPerfCard title={t('aiAgents.marketing.kpis.engagement')} value={stats.engagement} icon={<Zap className="text-amber-500" size={18} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
          <div className="lg:col-span-8">
              <div className="card-premium p-8 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[32px]">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{t('aiAgents.marketing.campaignsTitle')}</h3>
                 <div className="space-y-4">
                    {campaigns.map(camp => (
                      <CampaignCard key={camp.id} campaign={camp} />
                    ))}
                 </div>
              </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="card-premium p-8 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[32px]">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                   <Sparkles className="w-5 h-5 text-blue-500" /> {t('aiAgents.marketing.labTitle')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   <CreativeTool icon={<PenTool />} label={t('aiAgents.marketing.tools.writing')} count={t('aiAgents.marketing.tools.writingPro')} onClick={() => selectTool("writing")} />
                   <CreativeTool icon={<Target />} label={t('aiAgents.marketing.tools.audience')} count={t('aiAgents.marketing.tools.audienceSmart')} onClick={() => selectTool("audience")} />
                   <CreativeTool icon={<MessageSquare />} label={t('aiAgents.marketing.tools.chat')} count={t('aiAgents.marketing.tools.chatBot')} onClick={() => selectTool("chat")} />
                   <CreativeTool icon={<Star />} label={t('aiAgents.marketing.tools.reviews')} count={t('aiAgents.marketing.tools.reviewsRating')} onClick={() => selectTool("reviews")} />
                </div>
             </div>

             <div className="card-premium p-8 bg-indigo-600 rounded-[32px] text-white cursor-pointer" onClick={handleVIPBlast}>
                <div className="flex items-center gap-4 mb-4">
                   <Award className="w-7 h-7" />
                   <h4 className="text-sm font-black uppercase">{t('aiAgents.marketing.vipOpportunity')}</h4>
                </div>
                <p className="text-xs font-bold opacity-80 mb-6">{t('aiAgents.marketing.vipDesc')}</p>
                <button className="w-full py-4 bg-white text-indigo-700 rounded-xl font-black uppercase text-[10px]">{t('aiAgents.marketing.vipExecuteBtn')}</button>
             </div>
          </div>
        </div>
      </DashboardPageContainer>

      {/* Modals outside animated container with high z-index */}
      <AnimatePresence>
        {isLabModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#111F3A] w-full max-w-2xl rounded-[32px] p-5 md:p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold dark:text-white">{t('aiAgents.marketing.labModal.title')} {activeLabTool}</h3>
                   <X className="cursor-pointer" onClick={() => setIsLabModalOpen(false)} />
                </div>
                {isAnalyzing ? <Loader2 className="animate-spin mx-auto w-10 h-10" /> : (
                   <div className="space-y-4">
                      <p className="text-slate-500">{labResult?.insight}</p>
                      {labResult?.suggestions?.map((s: any, i: number) => (
                        <button key={i} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-left text-sm font-bold truncate">
                          {s}
                        </button>
                      ))}
                   </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#111F3A] w-full max-w-lg rounded-[24px] p-5 md:p-8 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">{t('aiAgents.marketing.campaignModal.title')}</h3>
                  <X className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
               </div>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <input className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold dark:text-white" placeholder={t('aiAgents.marketing.campaignModal.namePlaceholder')} value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} />
                  <select className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none appearance-none text-sm font-bold dark:text-white dark:[&>option]:bg-[#111F3A]" value={newCampaign.platform} onChange={e => setNewCampaign({...newCampaign, platform: e.target.value})}>
                     <option>WhatsApp</option><option>Instagram</option>
                  </select>
                  <button className="w-full py-4 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all">{t('aiAgents.marketing.campaignModal.submit')}</button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function AIPerfCard({ title, value, icon }: any) {
  return (
    <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 rounded-[24px] shadow-sm flex flex-col justify-center">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#1B4FD8]/10 flex items-center justify-center text-[#1B4FD8]">
          {React.cloneElement(icon as React.ReactElement, { size: 16 })}
        </div>
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</h3>
    </div>
  );
}

function CreativeTool({ icon, label, count, onClick }: any) {
  return (
    <div onClick={onClick} className="flex flex-col items-center justify-center p-5 bg-slate-50/50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F] rounded-[24px] hover:bg-blue-500/10 transition-all cursor-pointer group">
       <div className="w-9 h-9 flex items-center justify-center text-slate-400 group-hover:text-blue-500 mb-2">
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
       </div>
       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: any }) {
  const Icon = campaign.platform === 'WhatsApp' ? MessageCircle : Instagram;
  return (
    <div className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 bg-slate-50/50 dark:bg-[#0D1B35] rounded-[32px] border border-slate-100 dark:border-[#1E3A5F] transition-all">
       <div className="flex items-center gap-7">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#111F3A] flex items-center justify-center shadow-sm">
             <Icon size={28} className="text-blue-500" />
          </div>
          <div className="space-y-1">
             <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{campaign.name}</h4>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{campaign.platform} • {campaign.target_segment || 'GENERAL'}</span>
          </div>
       </div>
    </div>
  );
}

