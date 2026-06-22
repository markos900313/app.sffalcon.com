"use client";

import React, { useState, useEffect } from "react";
import { 
  FileSearch, 
  TrendingDown, 
  AlertCircle, 
  Upload, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown,
  BrainCircuit,
  Receipt,
  Search,
  RefreshCw,
  CheckCircle2,
  Euro,
  Save,
  Plus,
  Trash2,
  X,
  Bot,
  Zap,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Clock,
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { useLanguage } from "@/lib/LanguageContext";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";

export default function AgentAccountingPage() {
  const { t, language } = useLanguage();

  // View Transitions CSS Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      ::view-transition-group(*),
      ::view-transition-old(*),
      ::view-transition-new(*) {
        animation-duration: 0.25s;
        animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const supabase = createClient();
  const { organization } = useOrganization();
  
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    foodCost: "0%",
    totalExpenses: "0 €",
    savings: "0 €",
    auditScore: 85
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showPredictiveModal, setShowPredictiveModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (organization?.id) {
      fetchAccountingData();
    } else {
      setLoading(false);
    }
  }, [organization]);

  async function fetchAccountingData() {
    setLoading(true);
    try {
      const { data: expenses } = await supabase
        .from('business_entries')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });

      const { data: sales } = await supabase
        .from('invoices')
        .select('total')
        .eq('organization_id', organization!.id);

      if (expenses) {
        setInvoices(expenses);
        const totalExp = expenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        const totalSales = sales?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 1;
        
        setStats({
          foodCost: `${((totalExp / totalSales) * 100).toFixed(1)}%`,
          totalExpenses: `${totalExp.toLocaleString()} €`,
          savings: `${(totalExp * 0.05).toFixed(0)} €`,
          auditScore: 88
        });
      }
    } catch (err) {
      console.error("Error fetching accounting data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedData(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('aiAgents.accounting.toast.confirmDelete'))) return;
    
    try {
      const { error } = await supabase
        .from('business_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInvoices(invoices.filter(inv => inv.id !== id));
      toast.success(t('aiAgents.accounting.toast.deleteSuccess'));
    } catch (err) {
      toast.error(t('aiAgents.accounting.toast.deleteError'));
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) {
      toast.error(t('aiAgents.accounting.toast.selectInvoice'));
      return;
    }

    setIsScanning(true);
    setScanProgress(20);
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(selectedFile);
      });
      
      const base64String = await base64Promise as string;
      setScanProgress(40);
      
      const response = await fetch('/api/ai-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'invoice_ocr',
          fileData: base64String.split(',')[1],
          fileMimeType: selectedFile.type,
          message: "Extrae los datos de esta factura."
        })
      });

      setScanProgress(80);
      const result = await response.json();
      
      if (result.response) {
        try {
          const rawResponse = result.response.toString();
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          const cleanJson = jsonMatch ? jsonMatch[0] : rawResponse;
          const parsed = JSON.parse(cleanJson);
          
          setExtractedData(parsed);
          setScanProgress(100);
          setTimeout(() => {
            setIsScanning(false);
            toast.success(t('aiAgents.accounting.toast.scanSuccess'));
          }, 500);
        } catch (e) {
          throw new Error(t('aiAgents.accounting.toast.invalidFormat'));
        }
      } else {
        throw new Error(result.error || t('aiAgents.accounting.toast.emptyResponse'));
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Error'}`);
      setIsScanning(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!extractedData || !organization) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('aiAgents.accounting.toast.notAuthenticated'));

      const dateObj = extractedData.date ? new Date(extractedData.date) : new Date();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();

      const { error } = await supabase
        .from('business_entries')
        .insert([{
          user_id: user.id,
          organization_id: organization.id,
          concept: `${extractedData.concept || extractedData.proveedor || "Gasto IA"} - ${extractedData.nif || ''}`,
          amount: parseFloat(extractedData.amount || extractedData.total || 0),
          type: 'gasto',
          category: 'Varios',
          month,
          year
        }]);

      if (error) throw error;
      
      toast.success(t('aiAgents.accounting.toast.saveSuccess'));
      setIsUploading(false);
      setSelectedFile(null);
      setExtractedData(null);
      fetchAccountingData();
    } catch (err) {
      toast.error(t('aiAgents.accounting.toast.saveError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardPageContainer className="relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Ultra-Banner Hero - COMPACT DESIGN */}
      <div 
        className="w-full card-premium p-0 overflow-hidden shadow-2xl shadow-blue-500/5 relative group bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-500/5 opacity-50 transition-opacity group-hover:opacity-80" />
        
        <DashboardSection className="relative py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FD8] to-[#0891B2] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
               <motion.div
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
               >
                 <BrainCircuit className="w-8 h-8 text-white" />
               </motion.div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1B4FD8]">{t('aiAgents.accounting.subtitle')}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest">v5.2</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                 {language === 'es' ? (
                   <>Agente <span className="text-[#1B4FD8]">Contable</span></>
                 ) : (
                   <>Accounting <span className="text-[#1B4FD8]">Agent</span></>
                 )}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              onClick={() => setIsUploading(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2.5 transition-all shadow-lg shadow-blue-500/20"
            >
              <Upload size={14} />
              {t('aiAgents.accounting.processInvoices')}
            </motion.button>
            
            <div className="h-10 w-px bg-slate-100 dark:bg-[#1E3A5F] mx-2 hidden lg:block" />
            
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.statusLabel')}</span>
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t('aiAgents.accounting.operative')}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('aiAgents.accounting.visionActive')}
                </p>
            </div>
          </div>
        </DashboardSection>
      </div>

      <div className="space-y-6 mt-6">
        {/* KPI Grid - SPACIOUS VERSION */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <AIPerfCard title={t('aiAgents.accounting.kpis.foodCost')} value={stats.foodCost} trend="down" icon={<TrendingDown className="text-emerald-500" />} />
          <AIPerfCard title={t('aiAgents.accounting.kpis.operatingExpenses')} value={stats.totalExpenses} trend="up" icon={<Euro className="text-rose-500" />} />
          <AIPerfCard title={t('aiAgents.accounting.kpis.savings')} value={stats.savings} trend="neutral" icon={<Bot className="text-blue-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[24px] overflow-hidden shadow-sm">
              <div className="py-6 px-4 md:px-8 border-b border-slate-50 dark:border-[#1E3A5F] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-500" />
                    {t('aiAgents.accounting.ecosystemTitle')}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('aiAgents.accounting.validatedLabel')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative hidden md:block">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={t('aiAgents.accounting.filterPlaceholder')}
                      className="bg-slate-50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F] rounded-lg py-2 pl-9 pr-3 text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none w-40 transition-all"
                    />
                  </div>
                  <button onClick={() => fetchAccountingData()} className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                     <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/30 dark:bg-[#0D1B35]/30 border-b border-slate-50 dark:border-[#1E3A5F]">
                      <th className="px-4 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.table.concept')}</th>
                      <th className="px-4 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.table.amount')}</th>
                      <th className="px-4 md:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{t('aiAgents.accounting.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">
                    {invoices.length > 0 ? invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-blue-500/5 transition-all group">
                        <td className="px-4 md:px-8 py-4">
                          <span className="text-xs font-bold text-slate-800 dark:text-white uppercase italic group-hover:text-blue-500 transition-colors block">{inv.concept}</span>
                          <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                             <Clock size={10} />
                             <p className="text-[9px] font-bold uppercase tracking-widest">
                               {new Date(inv.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                             </p>
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{t('aiAgents.accounting.table.verified')}</span>
                          </div>
                          <div className="mt-1 text-sm font-black text-slate-900 dark:text-white tabular-nums">
                             {inv.amount?.toLocaleString()} €
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-4 text-right">
                           <button 
                             onClick={() => handleDelete(inv.id)}
                             className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                           >
                             <Trash2 size={14} />
                           </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center opacity-40">
                           <Receipt size={40} className="mx-auto mb-3 text-slate-400" />
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{t('aiAgents.accounting.table.noRecords')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-premium p-6 md:p-8 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[24px] shadow-sm relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                {t('aiAgents.accounting.insightsTitle')}
              </h3>
              <div className="space-y-3">
                <InsightCard 
                  title={t('aiAgents.accounting.insights.stockOptTitle')}
                  message={t('aiAgents.accounting.insights.stockOptMessage')}
                  type="warning"
                />
                <InsightCard 
                  title={t('aiAgents.accounting.insights.savingTitle')}
                  message={t('aiAgents.accounting.insights.savingMessage')}
                  type="success"
                />
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-[#1E3A5F]">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.accountingHealth')}</span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t('aiAgents.accounting.optimalHealth')}</span>
                 </div>
                 <div className="h-1 bg-slate-100 dark:bg-[#0D1B35] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.auditScore}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                 </div>
              </div>
            </div>

            <div className="card-premium p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[24px] shadow-lg shadow-blue-600/15 text-white relative overflow-hidden group cursor-pointer border border-white/10">
              <div className="relative z-10">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                   {t('aiAgents.accounting.predictionTitle')}
                 </h3>
                 <p className="text-3xl font-black italic tracking-tighter mb-1.5">
                   {invoices.length > 0 ? (invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0) * 1.05).toLocaleString() : '0'} €
                 </p>
                 <div className="flex items-center gap-2 text-white/70 text-[9px] font-black uppercase mb-8">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span>{t('aiAgents.accounting.projectedThisMonth')}</span>
                  </div>
                  <button 
                    onClick={() => setShowPredictiveModal(true)}
                    className="w-full py-4 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95"
                  >
                     {t('aiAgents.accounting.viewFullDiagnostic')}
                  </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* OCR Visual Artificial Modal */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsUploading(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[24px] md:rounded-[32px] max-w-lg w-full flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b border-slate-50 dark:border-[#1E3A5F]">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">{t('aiAgents.accounting.ocrModal.title')}</h2>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{t('aiAgents.accounting.ocrModal.ocrSync')}</p>
                 </div>
                 <button onClick={() => setIsUploading(false)} className="p-2.5 bg-slate-50 dark:bg-[#0D1B35] rounded-xl text-slate-400 hover:text-rose-500 transition-all">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-5 md:p-8 space-y-8 max-h-[70vh] md:max-h-[75vh] overflow-y-auto">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-[#1E3A5F] rounded-[24px] py-14 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group flex flex-col items-center gap-5"
                >
                   <div className="w-20 h-20 rounded-[24px] bg-slate-50 dark:bg-[#0D1B35] flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:scale-105 transition-all duration-500 border border-slate-100 dark:border-[#1E3A5F]">
                      {extractedData ? <CheckCircle2 size={40} className="text-emerald-500" /> : <Plus size={40} />}
                   </div>
                   <div className="text-center">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5">
                        {selectedFile ? selectedFile.name : t('aiAgents.accounting.ocrModal.uploadInvoice')}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.ocrModal.uploadFormats')}</p>
                   </div>
                </div>
                
                <input 
                  type="file" ref={fileInputRef} onChange={handleFileChange}
                  accept="image/*,application/pdf" className="hidden"
                />

                <AnimatePresence>
                  {extractedData && !isScanning && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F] rounded-[20px] p-6 shadow-inner"
                    >
                       <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{t('aiAgents.accounting.ocrModal.diagnosticFinished')}</h4>
                          <div className="px-2 py-0.5 bg-emerald-500/10 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">{t('aiAgents.accounting.ocrModal.confidence')}</div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.ocrModal.concept')}</p>
                             <p className="text-sm font-black text-slate-900 dark:text-white italic tracking-tighter uppercase truncate">{extractedData.concept || extractedData.proveedor}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.ocrModal.amount')}</p>
                             <p className="text-2xl font-black text-blue-500 tabular-nums leading-none">{extractedData.amount || extractedData.total} €</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{t('aiAgents.accounting.ocrModal.concept')}</p>
                             <p className="text-xs font-bold text-slate-800 dark:text-white tracking-widest uppercase">{extractedData.nif || '---'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('aiAgents.accounting.ocrModal.date')}</p>
                             <p className="text-xs font-bold text-slate-800 dark:text-white">{extractedData.date || '---'}</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 bg-slate-50 dark:bg-[#0D1B35] flex gap-3 border-t border-slate-50 dark:border-[#1E3A5F]">
                 <button 
                   onClick={() => setIsUploading(false)}
                   className="flex-1 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-[#1E3A5F]/40 rounded-xl transition-all"
                 >
                   {t('aiAgents.accounting.ocrModal.cancel')}
                 </button>
                 {extractedData ? (
                   <button 
                     onClick={handleSaveInvoice}
                     className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                     <Save size={14} />
                     {t('aiAgents.accounting.ocrModal.validateSave')}
                   </button>
                 ) : (
                   <button 
                     onClick={handleStartScan}
                     disabled={isScanning || !selectedFile}
                     className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isScanning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                        <Zap size={14} className="fill-white" />
                     )}
                     {isScanning ? `${t('aiAgents.accounting.ocrModal.scanning')}: ${scanProgress}%` : t('aiAgents.accounting.ocrModal.startScan')}
                   </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Predictive Modal */}
      <AnimatePresence>
        {showPredictiveModal && (
          <PredictiveModal onClose={() => setShowPredictiveModal(false)} invoices={invoices} />
        )}
      </AnimatePresence>

    </DashboardPageContainer>
  );
}

// STANDARD COMPONENTS
function AIPerfCard({ title, value, trend, icon }: any) {
  const { t } = useLanguage();
  return (
    <div className="card-premium bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] p-6 md:p-8 rounded-[24px] flex flex-col justify-between group transition-all hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm relative overflow-hidden min-h-[160px]">
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-[#0D1B35]/50 border border-slate-100 dark:border-[#1E3A5F] flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-105 group-hover:bg-[#1B4FD8]/10 group-hover:text-[#1B4FD8]">
          {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </div>
        {trend && (
           <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter", 
             trend === 'down' ? 'bg-emerald-500/10 text-emerald-500' : 
             trend === 'up' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
           )}>
             {trend === 'down' ? t('aiAgents.accounting.kpis.trendOptimal') : trend === 'up' ? t('aiAgents.accounting.kpis.trendAlert') : t('aiAgents.accounting.kpis.trendStable')}
           </div>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none mb-1">{value}</p>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
    </div>
  );
}

function InsightCard({ title, message, type }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300 group hover:shadow-lg",
        type === 'warning' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-emerald-500/5 border-emerald-500/10'
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
        type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
      )}>
        {type === 'warning' ? <ShieldCheck size={14} /> : <Award size={14} />}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">{title}</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{message}</p>
      </div>
    </motion.div>
  );
}

function PredictiveModal({ onClose, invoices }: any) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-[32px] max-w-md w-full flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
           <div className="w-16 h-16 rounded-[24px] bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-200 dark:border-blue-500/20">
              <Activity className="w-8 h-8 text-blue-600 drop-shadow-glow" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mb-4">{t('aiAgents.accounting.predictiveModal.diagnosticTitle')}</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold max-w-xs mx-auto leading-relaxed">
             {t('aiAgents.accounting.predictiveModal.diagnosticDesc').replace('{count}', invoices.length.toString())}
           </p>

           <div className="mt-10 space-y-6">
              <div className="p-6 rounded-[24px] bg-slate-50 dark:bg-[#0D1B35] border border-slate-100 dark:border-[#1E3A5F]">
                 <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] flex items-center justify-center shrink-0">
                       <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div>
                       <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-1 font-bold">{t('aiAgents.accounting.predictiveModal.logisticsTitle')}</h5>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-bold uppercase">
                          {t('aiAgents.accounting.predictiveModal.logisticsDesc')}
                       </p>
                    </div>
                 </div>
                 <div className="my-5 border-t border-slate-200 dark:border-[#1E3A5F]" />
                 <div className="flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] flex items-center justify-center shrink-0">
                       <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                    </div>
                    <div>
                       <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-1 font-bold">{t('aiAgents.accounting.predictiveModal.energyTitle')}</h5>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-bold uppercase">
                          {t('aiAgents.accounting.predictiveModal.energyDesc')}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="px-5 md:px-8 py-4 md:py-5 bg-slate-50 dark:bg-[#0D1B35] border-t border-slate-50 dark:border-[#1E3A5F]">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            {t('aiAgents.accounting.predictiveModal.syncStrategy')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
