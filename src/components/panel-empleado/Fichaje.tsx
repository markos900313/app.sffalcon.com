"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  History,
  Calendar,
  RefreshCw,
  MapPin,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMinutes, isWithinInterval } from "date-fns";
import { useLanguage } from "@/lib/LanguageContext";

function getEstadoGeo(distance: number | null | undefined, geoRadius: number) {
  if (distance === null || distance === undefined) return '-';
  if (distance <= geoRadius) return 'CORRECTO';
  return 'INCORRECTO';
}

interface FichajeProps {
  staff: any;
}

export default function Fichaje({ staff }: FichajeProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === 'en' ? enUS : es;
  const supabase = createClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [history14Days, setHistory14Days] = useState<any[]>([]);
  const [orgConfig, setOrgConfig] = useState<any>(null);
  const [viewTab, setViewTab] = useState<'HOY' | 'SEMANA' | 'MES'>('HOY');
  const [periodHistory, setPeriodHistory] = useState<any[]>([]);
  const [obtainingGps, setObtainingGps] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchTodayFichajes();
    fetch14DayHistory();
    fetchOrgConfig();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (viewTab !== 'HOY') {
      fetchPeriodHistory(viewTab);
    }
  }, [viewTab]);

  async function fetchOrgConfig() {
    const { data } = await supabase
      .from('organizations')
      .select('latitude, longitude, geo_radius')
      .eq('id', staff.organization_id)
      .single();
    setOrgConfig(data);
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  async function fetchTodayFichajes() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('fichajes')
      .select('*')
      .eq('staff_id', staff.id)
      .gte('timestamp', startOfDay.toISOString())
      .order('timestamp', { ascending: false });

    setTodayEvents(data || []);
  }

  async function fetchPeriodHistory(period: 'SEMANA' | 'MES') {
    const now = new Date();
    let start, end;

    if (period === 'SEMANA') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      start = sevenDaysAgo.toISOString();
      end = now.toISOString();
    } else {
      start = startOfMonth(now).toISOString();
      end = endOfMonth(now).toISOString();
    }

    const { data } = await supabase
      .from('fichajes')
      .select('*')
      .eq('staff_id', staff.id)
      .gte('timestamp', start)
      .lte('timestamp', end)
      .order('timestamp', { ascending: true });

    if (data) {
      const grouped = data.reduce((acc: any, curr: any) => {
        const date = format(new Date(curr.timestamp), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
      }, {});

      const processed = Object.entries(grouped)
        .map(([date, events]: [string, any]) => {
          let totalMs = 0;
          let firstIn: string | null = null;
          let lastOut: string | null = null;
          let entryTime: number | null = null;
          let allCorrect = true;
          let hasGeo = false;

          events.forEach((ev: any) => {
            if (ev.distance_meters != null) {
              hasGeo = true;
              if (ev.distance_meters > (orgConfig?.geo_radius || 200)) allCorrect = false;
            }

            if (ev.tipo === 'entrada') {
              entryTime = new Date(ev.timestamp).getTime();
              if (firstIn === null) firstIn = format(new Date(ev.timestamp), 'HH:mm');
            } else if (ev.tipo === 'salida' && entryTime !== null) {
              totalMs += new Date(ev.timestamp).getTime() - entryTime;
              entryTime = null;
              lastOut = format(new Date(ev.timestamp), 'HH:mm');
            }
          });

          const geoStatus = !hasGeo ? '-' : (allCorrect ? 'CORRECTO' : 'INCORRECTO');
          const h = Math.floor(totalMs / 3600000);
          const m = Math.floor((totalMs % 3600000) / 60000);

          return {
            date,
            firstIn,
            lastOut,
            totalStr: `${h}h ${m}m`,
            totalHours: totalMs / 3600000,
            geoStatus
          };
        })
        .reverse();

      setPeriodHistory(processed);
    }
  }

  async function fetch14DayHistory() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('fichajes')
      .select('*')
      .eq('staff_id', staff.id)
      .gte('timestamp', fourteenDaysAgo.toISOString())
      .order('timestamp', { ascending: true });

    if (data) {
      const grouped = data.reduce((acc: any, curr: any) => {
        const date = format(new Date(curr.timestamp), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
      }, {});

      const processed = Object.entries(grouped)
        .map(([date, events]: [string, any]) => {
           let totalMs = 0;
           let firstIn: string | null = null;
           let lastOut: string | null = null;
           let entryTime: number | null = null;

          events.forEach((ev: any) => {
            if (ev.tipo === 'entrada') {
              entryTime = new Date(ev.timestamp).getTime();
              if (firstIn === null) firstIn = format(new Date(ev.timestamp), 'HH:mm');
            } else if (ev.tipo === 'salida' && entryTime !== null) {
              totalMs += new Date(ev.timestamp).getTime() - entryTime;
              entryTime = null;
              lastOut = format(new Date(ev.timestamp), 'HH:mm');
            }
          });

          const isToday = date === format(new Date(), 'yyyy-MM-dd');
          const lastEv = events[events.length - 1];
          const inProgress = lastEv.tipo === 'entrada';

          const h = Math.floor(totalMs / 3600000);
          const m = Math.floor((totalMs % 3600000) / 60000);

          return {
            date,
            firstIn,
            lastOut,
            totalStr: inProgress ? t('employeePanel.fichaje.inProgress') : `${h}h ${m}m`,
            rawMs: totalMs,
            inProgress
          };
        })
        .reverse();

      setHistory14Days(processed);
    }
  }

  const exportCSV = () => {
    const headers = `${t('employeePanel.fichaje.date')},${t('employeePanel.fichaje.clockIn')},${t('employeePanel.fichaje.clockOut')},${t('employeePanel.fichaje.hoursWorked')}\n`;
    const rows = history14Days.map(d =>
      `${d.date},${d.firstIn || '--'},${d.lastOut || '--'},${d.totalStr}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `fichajes_${staff.full_name}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const now = new Date();
    const nowStr = format(now, "dd/MM/yyyy HH:mm");

    // --- CABECERA ---
    doc.setFillColor(30, 58, 95); // #1E3A5F
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(t('employeePanel.fichaje.pdf.title'), 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(t('employeePanel.fichaje.pdf.employee').replace('{name}', staff.full_name), 14, 25);
    doc.text(t('employeePanel.fichaje.pdf.period'), 14, 32);

    doc.setFontSize(8);
    doc.text(t('employeePanel.fichaje.pdf.exportDate').replace('{date}', nowStr), pageWidth - 14, 15, { align: 'right' });

    // --- TABLA HORAS TRABAJADAS ---
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t('employeePanel.fichaje.pdf.hoursWorked'), 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [[
        t('employeePanel.fichaje.pdf.headers.date'),
        t('employeePanel.fichaje.pdf.headers.clockIn'),
        t('employeePanel.fichaje.pdf.headers.clockOut'),
        t('employeePanel.fichaje.pdf.headers.totalHours')
      ]],
      body: history14Days.map(d => [
        format(new Date(d.date + 'T12:00:00'), 'dd/MM/yyyy'),
        d.firstIn || '--',
        d.lastOut || '--',
        d.totalStr
      ]),
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 8 },
    });

    // --- TABLA ACTIVIDAD DETALLADA ---
    doc.addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t('employeePanel.fichaje.pdf.detailedActivity'), 14, 20);

    // Fetch all 14 day events raw for the detailed table
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const { data: rawEvents } = await supabase
      .from('fichajes')
      .select('*')
      .eq('staff_id', staff.id)
      .gte('timestamp', fourteenDaysAgo.toISOString())
      .order('timestamp', { ascending: false });

    autoTable(doc, {
      startY: 25,
      head: [[
        t('employeePanel.fichaje.pdf.headers.date'),
        t('employeePanel.fichaje.pdf.headers.time'),
        t('employeePanel.fichaje.pdf.headers.action'),
        t('employeePanel.fichaje.pdf.headers.channel'),
        t('employeePanel.fichaje.pdf.headers.location'),
        t('employeePanel.fichaje.pdf.headers.status')
      ]],
      body: (rawEvents || []).map((f: any) => {
        const geoStatus = getEstadoGeo(f.distance_meters, orgConfig?.geo_radius || 200);
        const translatedGeoStatus = geoStatus === 'CORRECTO' ? t('employeePanel.fichaje.geo.correct') : geoStatus === 'INCORRECTO' ? t('employeePanel.fichaje.geo.incorrect') : geoStatus;
        return [
          format(parseISO(f.timestamp), "dd/MM/yyyy"),
          format(parseISO(f.timestamp), "HH:mm:ss"),
          (f.tipo === 'entrada' ? t('employeePanel.fichaje.clockIn') : t('employeePanel.fichaje.clockOut')).toUpperCase(),
          f.canal.toUpperCase(),
          (f.address_text || "-").substring(0, 40),
          translatedGeoStatus
        ];
      }),
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = data.cell.raw;
          if (val === 'CORRECTO' || val === t('employeePanel.fichaje.geo.correct')) data.cell.styles.textColor = [34, 197, 94];
          else if (val === 'INCORRECTO' || val === t('employeePanel.fichaje.geo.incorrect')) data.cell.styles.textColor = [239, 68, 68];
          else data.cell.styles.textColor = [100, 116, 139];
        }
      },
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 7 },
    });

    // --- PIE DE PÁGINA ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(t('employeePanel.fichaje.pdf.generatedBy'), pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text(t('employeePanel.fichaje.pdf.page') + i + t('employeePanel.fichaje.pdf.of') + pageCount, pageWidth - 20, doc.internal.pageSize.height - 10);
    }

    doc.save(`fichajes_${staff.full_name.replace(/\s+/g, '_')}_${format(now, "yyyy-MM-dd")}.pdf`);
  };

  const handleFichaje = async (tipo: 'entrada' | 'salida') => {
    if (isLocked) return;
    setLoading(true);
    setObtainingGps(true);

    if (!navigator.geolocation) {
      setLoading(false);
      setObtainingGps(false);
      return toast.error(t('employeePanel.fichaje.toast.geoNotSupported'));
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      setObtainingGps(false);
      const empLat = position.coords.latitude;
      const empLng = position.coords.longitude;

      try {
        // 2. Fetch coordenadas del negocio vía API
        const orgRes = await fetch(`/api/org-geo?org_id=${staff.organization_id}`);
        const orgGeo = orgRes.ok ? await orgRes.json() : null;

        console.log('ORG GEO RESULT:', JSON.stringify(orgGeo));
        console.log('EMP COORDS:', empLat, empLng);

        const orgLat = orgGeo?.latitude;
        const orgLng = orgGeo?.longitude;
        const orgRadius = orgGeo?.geo_radius ?? 200;

        // 3. Calcular distancia AQUÍ antes de Nominatim
        let distanceMeters = null;
        if (orgLat != null && orgLng != null) {
          distanceMeters = Math.round(
            calculateDistance(empLat, empLng, orgLat, orgLng)
          );
          console.log('DISTANCE CALCULATED:', distanceMeters, 'metros');
        } else {
          console.warn('ORG COORDS NULL - no se puede calcular distancia');
        }

        // 4. Verificar radio ANTES de Nominatim
        if (orgLat != null && distanceMeters !== null && distanceMeters > orgRadius) {
          setLoading(false);
          return toast.error(
            t('employeePanel.fichaje.toast.outOfArea')
              .replace('{distance}', distanceMeters.toString())
              .replace('{radius}', orgRadius.toString())
          );
        }

        // 5. Obtener dirección con Nominatim (después de validar)
        let addressText = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${empLat}&lon=${empLng}&format=json`,
            { headers: { 'User-Agent': 'SoporteFacil/1.0' } }
          );
          const data = await res.json();
          addressText = data.display_name || '';
        } catch (e) {
          console.error('Nominatim error:', e);
        }

        // 6. Insertar en Supabase con distancia real
        const { error } = await supabase.from('fichajes').insert({
          staff_id: staff.id,
          organization_id: staff.organization_id,
          tipo,
          timestamp: new Date().toISOString(),
          canal: 'web-panel',
          latitude: empLat,
          longitude: empLng,
          address_text: addressText,
          distance_meters: distanceMeters
        });

        if (error) throw error;

        setIsLocked(true);
        toast.success(tipo === 'entrada' ? t('employeePanel.fichaje.toast.clockInSuccess') : t('employeePanel.fichaje.toast.clockOutSuccess'), {
          icon: tipo === 'entrada' ? "🚀" : "👋"
        });
        fetchTodayFichajes();
        fetch14DayHistory();
        setTimeout(() => setIsLocked(false), 5000);
      } catch (err: any) {
        toast.error(t('employeePanel.fichaje.toast.errorPrefix') + err.message);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setLoading(false);
      setObtainingGps(false);
      toast.error(t('employeePanel.fichaje.toast.locationError') + err.message);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  };

  const lastEvent = todayEvents[0];
  const canCheckIn = !lastEvent || lastEvent.tipo === 'salida';
  const canCheckOut = lastEvent && lastEvent.tipo === 'entrada';

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 space-y-8">
        <div className="card-premium p-10 text-center rounded-[40px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1B4FD8] mb-4">{t('employeePanel.fichaje.title')}</span>
            <div className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white flex items-baseline gap-2">
              {format(currentTime, "HH:mm")}
              <span className="text-3xl text-slate-300 dark:text-[#1E3A5F] font-black animate-pulse">:</span>
              <span className="text-4xl md:text-5xl text-slate-400 tabular-nums">{format(currentTime, "ss")}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6">
              {format(currentTime, language === 'en' ? "EEEE, MMMM d" : "EEEE, d 'de' MMMM", { locale: dateLocale })}
            </p>
          </div>
          <div className="flex flex-row items-center gap-4 pt-8">
            <button
              onClick={() => handleFichaje('entrada')}
              disabled={loading || isLocked || !canCheckIn}
              className={cn(
                "flex-1 h-[64px] flex items-center justify-center gap-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50",
                canCheckIn ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400"
              )}
            >
              {loading && canCheckIn ? <RefreshCw className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              <span className="text-[11px] font-black uppercase tracking-widest">{loading && canCheckIn ? (obtainingGps ? t('employeePanel.fichaje.obtainingGps') : t('employeePanel.fichaje.validating')) : t('employeePanel.fichaje.clockIn')}</span>
            </button>
            <button
              onClick={() => handleFichaje('salida')}
              disabled={loading || isLocked || !canCheckOut}
              className={cn(
                "flex-1 h-[64px] flex items-center justify-center gap-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50",
                canCheckOut ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400"
              )}
            >
              {loading && canCheckOut ? <RefreshCw className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              <span className="text-[11px] font-black uppercase tracking-widest">{loading && canCheckOut ? (obtainingGps ? t('employeePanel.fichaje.obtainingGps') : t('employeePanel.fichaje.validating')) : t('employeePanel.fichaje.clockOut')}</span>
            </button>
          </div>
        </div>
        <div className="card-premium rounded-[32px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F]">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-[#1B4FD8]" />
              <h3 className="text-xs font-black uppercase tracking-widest">{t('employeePanel.fichaje.activity')}</h3>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
              {['HOY', 'SEMANA', 'MES'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab as any)}
                  className={cn(
                    "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                    viewTab === tab
                      ? "bg-white dark:bg-white/10 text-[#1B4FD8] dark:text-blue-400 shadow-sm border border-blue-500/10"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  {tab === 'HOY' ? t('employeePanel.fichaje.tabs.today') : tab === 'SEMANA' ? t('employeePanel.fichaje.tabs.week') : t('employeePanel.fichaje.tabs.month')}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {viewTab === 'HOY' ? (
              todayEvents.map((event, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      event.tipo === 'entrada' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {event.tipo === 'entrada' ? <LogIn size={18} /> : <LogOut size={18} />}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                        {event.tipo === 'entrada' ? t('employeePanel.fichaje.clockIn') : t('employeePanel.fichaje.clockOut')}
                        {event.address_text && (
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                            getEstadoGeo(event.distance_meters, orgConfig?.geo_radius || 200) === 'CORRECTO'
                              ? "bg-emerald-500/10 text-emerald-600"
                              : getEstadoGeo(event.distance_meters, orgConfig?.geo_radius || 200) === 'INCORRECTO'
                                ? "bg-rose-500/10 text-rose-600"
                                : "bg-slate-100 dark:bg-white/5 text-slate-400"
                          )}>
                            <MapPin size={8} /> {event.distance_meters != null ? `${event.distance_meters}m` : "-"}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(event.timestamp), "HH:mm:ss")}</span>
                        {event.address_text && (
                          <span className="text-[8px] text-slate-400/60 line-clamp-1 max-w-[150px]">{event.address_text}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400">{t('employeePanel.fichaje.verified')}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4">{t('employeePanel.fichaje.date')}</th>
                      <th className="px-6 py-4">{t('employeePanel.fichaje.clockIn')}</th>
                      <th className="px-6 py-4">{t('employeePanel.fichaje.clockOut')}</th>
                      <th className="px-6 py-4 text-center">{t('employeePanel.fichaje.total')}</th>
                      <th className="px-6 py-4 text-right">Geo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {periodHistory.map((day, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-black uppercase">
                          {format(new Date(day.date + 'T12:00:00'), language === 'en' ? 'dd MMM' : 'dd MMM', { locale: dateLocale })}
                        </td>
                        <td className="px-6 py-4 text-[9px] font-bold text-slate-500 tabular-nums">{day.firstIn || '--'}</td>
                        <td className="px-6 py-4 text-[9px] font-bold text-slate-500 tabular-nums">{day.lastOut || '--'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-lg">
                            {day.totalStr}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                            day.geoStatus === 'CORRECTO' ? "bg-emerald-500/10 text-emerald-500" :
                              day.geoStatus === 'INCORRECTO' ? "bg-rose-500/10 text-rose-500" :
                                "bg-slate-100 dark:bg-white/5 text-slate-400"
                          )}>
                            {day.geoStatus === 'CORRECTO' ? t('employeePanel.fichaje.geo.correct') : day.geoStatus === 'INCORRECTO' ? t('employeePanel.fichaje.geo.incorrect') : day.geoStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{t('employeePanel.fichaje.totalPeriod')}</span>
                  <span className="text-sm font-black text-[#1B4FD8] dark:text-blue-400">
                    {periodHistory.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1)}h
                  </span>
                </div>
              </div>
            )}
            {((viewTab === 'HOY' && todayEvents.length === 0) || (viewTab !== 'HOY' && periodHistory.length === 0)) && (
              <div className="p-10 text-center text-slate-300 text-[10px] uppercase font-black tracking-widest">{t('employeePanel.fichaje.noActivityToday')}</div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full xl:w-96 space-y-6">
        <div className="card-premium rounded-[32px] bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('employeePanel.fichaje.hoursWorked')}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('employeePanel.fichaje.last14Days')}</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-white/5 z-10">
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.fichaje.date')}</th>
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('employeePanel.fichaje.es')}</th>
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">{t('employeePanel.fichaje.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {history14Days.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                        {format(new Date(day.date + 'T12:00:00'), 'dd MMM', { locale: dateLocale })}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[9px] font-bold text-slate-400 tabular-nums">
                        {day.firstIn || '--'} <span className="opacity-30">|</span> {day.lastOut || '--'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[9px] font-black uppercase tabular-nums",
                        day.inProgress ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {day.totalStr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 space-y-2">
            <button
              onClick={exportPDF}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <FileText size={14} />
              {t('employeePanel.fichaje.exportPdf')}
            </button>
            <button
              onClick={exportCSV}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <History size={14} />
              {t('employeePanel.fichaje.exportCsv')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
