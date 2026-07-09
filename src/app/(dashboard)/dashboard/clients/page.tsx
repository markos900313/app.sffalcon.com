"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Layers,
  BarChart3,
  Loader2,
  Upload,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPageContainer, DashboardSection } from "@/components/dashboard/DashboardPageContainer";
import dynamic from "next/dynamic";
const ClientModal = dynamic(() => import("@/components/dashboard/clients/ClientModal"), {
  ssr: false,
  loading: () => null
});
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { hasClientPipeline } from "@/lib/sectorConfig";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/LanguageContext";
import { format } from "date-fns";

// Componentes tipo pestaña
import ClientsList from "@/components/dashboard/clients/ClientsList";
import ClientsPipeline from "@/components/dashboard/clients/ClientsPipeline";
const ClientsAnalytics = dynamic(() => import("@/components/dashboard/clients/ClientsAnalytics"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-[#162040]/30 animate-pulse rounded-2xl border border-[#1E3A5F]/40" />
});
import { Client } from "./types";

const parseCSV = (text: string) => {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  const splitLine = (line: string) => {
    return line.split(new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`))
      .map(part => part.replace(/^"|"$/g, '').trim());
  };

  const firstRow = splitLine(firstLine);
  let headerMap: { [key: string]: number } = {
    name: 0,
    email: 1,
    phone: 2,
    address: 3,
    notes: 4
  };

  const isHeader = firstRow.some(col => 
    ['name', 'nombre', 'email', 'correo', 'phone', 'telefono', 'teléfono', 'address', 'dirección', 'direccion', 'notes', 'notas'].includes(col.toLowerCase())
  );

  let startIndex = 0;
  if (isHeader) {
    startIndex = 1;
    firstRow.forEach((col, idx) => {
      const lower = col.toLowerCase();
      if (lower.includes('name') || lower.includes('nombre')) headerMap.name = idx;
      else if (lower.includes('email') || lower.includes('correo') || lower.includes('mail')) headerMap.email = idx;
      else if (lower.includes('phone') || lower.includes('telefono') || lower.includes('teléfono') || lower.includes('móvil') || lower.includes('movil')) headerMap.phone = idx;
      else if (lower.includes('address') || lower.includes('dirección') || lower.includes('direccion') || lower.includes('calle')) headerMap.address = idx;
      else if (lower.includes('notes') || lower.includes('notas')) headerMap.notes = idx;
    });
  }

  const parsedRecords: any[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const row = splitLine(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const name = row[headerMap.name] || '';
    const email = row[headerMap.email] || '';
    const phone = row[headerMap.phone] || '';
    const address = row[headerMap.address] || '';
    const notes = row[headerMap.notes] || '';

    if (name) {
      parsedRecords.push({ name, email, phone, address, notes });
    }
  }

  return parsedRecords;
};

type TabType = 'list' | 'pipeline' | 'analytics';

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0, reservationsThisMonth: 0 });
  const { organization } = useOrganization();
  const { t } = useLanguage();
  const supabase = createClient();

  // CSV Import/Export States
  const [importPreviewData, setImportPreviewData] = useState<any[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = async () => {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('name, email, phone, address, notes')
        .eq('organization_id', organization.id)
        .order('name', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No hay clientes para exportar.");
        return;
      }

      const headers = ["Name", "Email", "Phone", "Address", "Notes"];
      const csvRows = [headers.join(",")];
      
      data.forEach((client: any) => {
        const values = [
          client.name || "",
          client.email || "",
          client.phone || "",
          client.address || "",
          client.notes || ""
        ].map(val => {
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      });

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Clientes_${organization.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exportado correctamente.");
    } catch (err) {
      console.error("Error exporting clients:", err);
      toast.error("Error al exportar clientes.");
    }
  };

  const handleImportClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setImportPreviewData(parsed);
        } else {
          toast.error("El archivo CSV está vacío o no tiene un formato válido.");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreviewData || !organization?.id) return;
    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: existing } = await supabase
        .from('clients')
        .select('email, phone')
        .eq('organization_id', organization.id);

      const existingPhones = new Set(existing?.map((c: any) => c.phone?.trim()).filter(Boolean));
      const existingEmails = new Set(existing?.map((c: any) => c.email?.trim()?.toLowerCase()).filter(Boolean));

      let importedCount = 0;
      let skippedCount = 0;

      const insertPayload: any[] = [];

      importPreviewData.forEach(row => {
        const name = row.name?.trim();
        const email = row.email?.trim();
        const phone = row.phone?.trim();
        const address = row.address?.trim();
        const notes = row.notes?.trim();

        if (!name) {
          skippedCount++;
          return;
        }

        const hasPhoneDup = phone && existingPhones.has(phone);
        const hasEmailDup = email && existingEmails.has(email.toLowerCase());

        if (hasPhoneDup || hasEmailDup) {
          skippedCount++;
          return;
        }

        insertPayload.push({
          organization_id: organization.id,
          user_id: user?.id || null,
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
          source: 'import',
          status: 'activo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        importedCount++;
      });

      if (insertPayload.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < insertPayload.length; i += batchSize) {
          const batch = insertPayload.slice(i, i + batchSize);
          const { error } = await supabase.from('clients').insert(batch);
          if (error) throw error;
        }
      }

      toast.success(`${importedCount} contactos importados, ${skippedCount} omitidos.`);
      setImportPreviewData(null);
      fetchClients();
    } catch (err) {
      console.error("Error importing clients:", err);
      toast.error("Ocurrió un error al importar los clientes.");
    } finally {
      setImporting(false);
    }
  };

  const fetchClients = useCallback(async () => {
    try {
      if (!organization?.id) return;

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;
      setClients((clientsData as any) || []);

      // Fetch appointments for metrics
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: apptsData } = await supabase
        .from('appointments')
        .select('id')
        .eq('organization_id', organization.id)
        .gte('date', startOfMonth.toISOString().split('T')[0]);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const newClients = ((clientsData as any) || []).filter((c: any) => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;

      setStats({
        total: clientsData?.length || 0,
        newThisMonth: newClients,
        reservationsThisMonth: apptsData?.length || 0
      });
    } catch (error) {
      toast.error(t('clients.loadError' as any));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [supabase, t, organization?.id]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('clients.deleteConfirm' as any))) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('clients.deleteSuccess' as any));
      fetchClients();
    } catch (error) {
      toast.error(t('clients.deleteError' as any));
      console.error(error);
    }
  };

  const modules = organization?.sector_config;
  const normalizedSector = organization?.sector?.toLowerCase()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "") || 'default';
  const isRestauracion = normalizedSector === 'restauracion' || 
                        normalizedSector === 'hosteleria' || 
                        normalizedSector === 'restaurante';
  
  const isSalud = modules?.grupo === '2_salud';
  const showPipeline = (hasClientPipeline as any)(modules);
  const grupoNum = modules?.grupo ? parseInt(modules.grupo.split('_')[0]) : 1;

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'list', label: isSalud ? t('clients.tabs.directory' as any) : t('clients.tabs.allContacts' as any), icon: Users },
    ...(showPipeline ? [
      { id: 'pipeline', label: t('clients.tabs.pipeline' as any), icon: Layers } as const,
      { id: 'analytics', label: t('clients.tabs.metrics' as any), icon: BarChart3 } as const
    ] : [])
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <DashboardPageContainer>
        <div className="flex flex-col gap-6">
          {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-premium py-6 px-4 md:px-8 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">{t('clients.header.dbLabel' as any)}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">{t('clients.header.updatedLabel' as any)}</span>
            </div>
            <h1 className="text-base md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate border-b-2 border-emerald-500/20 pb-1">
              {t('clients.header.title' as any)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-2">
              {t('clients.header.desc' as any)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#1E3A5F] rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('clients.header.export' as any)}</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#1E3A5F] rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar CSV</span>
            </button>
            <button
              onClick={() => {
                setEditClient(null);
                setIsModalOpen(true);
              }} 
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#1B4FD8] hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 translate-y-0 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {t('clients.header.newContact' as any)}
              </span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".csv"
              onChange={handleImportClick}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium bg-white dark:bg-[#111F3A] p-6 md:p-8 border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('clients.stats.totalRecords' as any)}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
          </div>
          <div className="card-premium bg-white dark:bg-[#111F3A] p-6 md:p-8 border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('clients.stats.newThisMonth' as any)}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newThisMonth}</h3>
          </div>
          <div className="card-premium bg-white dark:bg-[#111F3A] p-6 md:p-8 border border-slate-200 dark:border-[#1E3A5F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('clients.stats.appointmentsThisMonth' as any)}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.reservationsThisMonth}</h3>
          </div>
        </div>

        <div className="min-h-[400px] animate-in slide-in-from-bottom-2 duration-500">
          {!loading && (
            <ClientsList 
              clients={clients} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              grupo={grupoNum}
            />
          )}
        </div>
      </div>
    </DashboardPageContainer>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditClient(null);
        }}
        onSuccess={fetchClients}
        editClient={editClient}
      />

      {importPreviewData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#111F3A] rounded-[24px] w-full max-w-2xl my-auto flex flex-col shadow-2xl border border-[#1E3A5F] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#1E3A5F] flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Previsualización de Importación
              </h3>
              <button 
                onClick={() => setImportPreviewData(null)}
                className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <p className="text-sm text-slate-300 font-medium">
                Se han detectado <span className="font-bold text-[#60A5FA]">{importPreviewData.length}</span> contactos listos para importar. Aquí tienes una muestra de los primeros 5 registros:
              </p>
              <div className="border border-[#1E3A5F] rounded-xl overflow-hidden bg-[#162040]/30">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#162040]/60 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-[#1E3A5F]">
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Dirección</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E3A5F]/40 text-slate-200">
                    {importPreviewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#162040]/20">
                        <td className="px-4 py-2.5 font-semibold text-white">{row.name}</td>
                        <td className="px-4 py-2.5 font-mono">{row.email || "-"}</td>
                        <td className="px-4 py-2.5 font-mono">{row.phone || "-"}</td>
                        <td className="px-4 py-2.5 truncate max-w-[120px]">{row.address || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#1E3A5F] bg-[#162040]/20 flex justify-end gap-3">
              <button
                onClick={() => setImportPreviewData(null)}
                className="px-5 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirmar Importación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
