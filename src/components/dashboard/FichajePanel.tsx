"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { format, startOfDay, endOfDay, differenceInMinutes, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Download, Clock, ChevronLeft, ChevronRight, RefreshCw, MapPin, Save, Navigation, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "react-hot-toast";

const MapPicker = dynamic(
  () => import('@/components/MapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-slate-100 dark:bg-slate-800 
        rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cargando mapa...</span>
      </div>
    )
  }
);

function getEstadoGeo(distance: number | null | undefined, geoRadius: number) {
  if (distance === null || distance === undefined) return '-';
  if (distance <= geoRadius) return 'CORRECTO';
  return 'INCORRECTO';
}

export default function FichajePanel() {
  const supabase = createClient();
  const { organization } = useOrganization();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fichajesRow, setFichajesRow] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [searching, setSearching] = useState(false);
  const [addressSearched, setAddressSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState(organization?.address_geocoded || "");
  const [searchStatus, setSearchStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [geoConfig, setGeoConfig] = useState({
    latitude: organization?.latitude
      ? parseFloat(String(organization.latitude))
      : null,
    longitude: organization?.longitude
      ? parseFloat(String(organization.longitude))
      : null,
    geo_radius: organization?.geo_radius || 200,
    address_geocoded: organization?.address_geocoded || ""
  });

  useEffect(() => {
    if (organization) {
      setGeoConfig({
        latitude: organization.latitude
          ? parseFloat(String(organization.latitude))
          : null,
        longitude: organization.longitude
          ? parseFloat(String(organization.longitude))
          : null,
        geo_radius: organization.geo_radius || 200,
        address_geocoded: organization.address_geocoded || ""
      });
      setSearchQuery(organization.address_geocoded || "");
      if (organization.address_geocoded) {
        setAddressSearched(true);
      }
      loadData();
    }
  }, [organization, selectedDate]);

  async function loadData() {
    setLoading(true);
    try {
      const inicioDia = startOfDay(selectedDate).toISOString();
      const finDia = endOfDay(selectedDate).toISOString();

      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('full_name');

      setStaffList(staffData || []);

      const { data: fichajesData } = await supabase
        .from('fichajes')
        .select('*, staff(full_name)')
        .eq('organization_id', organization!.id)
        .gte('timestamp', inicioDia)
        .lte('timestamp', finDia)
        .order('timestamp', { ascending: true });

      setFichajesRow(fichajesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const groupedData = staffList.map(staff => {
    const fichajesEmpleado = fichajesRow.filter(f => f.staff_id === staff.id);
    const entradas = fichajesEmpleado.filter(f => f.tipo === 'entrada');
    const salidas = fichajesEmpleado.filter(f => f.tipo === 'salida');

    const primeraEntrada = entradas.length > 0 ? entradas[0] : null;
    const ultimaSalida = salidas.length > 0 ? salidas[salidas.length - 1] : null;

    let estado = "SIN FICHAR";
    if (primeraEntrada && ultimaSalida) estado = "COMPLETO";
    else if (primeraEntrada && !ultimaSalida) estado = "EN TURNO";

    let horasTrabajadas = "-";
    if (primeraEntrada && ultimaSalida) {
      const min = differenceInMinutes(parseISO(ultimaSalida.timestamp), parseISO(primeraEntrada.timestamp));
      const hours = Math.floor(min / 60);
      const minutes = min % 60;
      horasTrabajadas = `${hours}h ${minutes}m`;
    }

    return {
      staff,
      estado,
      primeraEntrada: primeraEntrada ? format(parseISO(primeraEntrada.timestamp), "HH:mm") : "-",
      ultimaSalida: ultimaSalida ? format(parseISO(ultimaSalida.timestamp), "HH:mm") : "-",
      horasTrabajadas
    };
  });

  const handleExportPDF = () => {
    if (!organization) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const dateStr = format(selectedDate, "d MMMM yyyy", { locale: es }).toUpperCase();
    const nowStr = format(new Date(), "dd/MM/yyyy HH:mm");

    // --- CABECERA ---
    doc.setFillColor(30, 58, 95); // #1E3A5F
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE FICHAJES", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Panel de Control · ${organization.name}`, 14, 25);
    doc.text(`Fecha del informe: ${dateStr}`, 14, 32);

    doc.setFontSize(8);
    doc.text(`Exportado: ${nowStr}`, pageWidth - 14, 15, { align: 'right' });
    doc.text(`Ubicación: ${geoConfig.address_geocoded || 'No configurada'}`, pageWidth - 14, 22, { align: 'right' });
    doc.text(`Radio permitido: ${geoConfig.geo_radius || 200}m`, pageWidth - 14, 29, { align: 'right' });

    // --- RESUMEN (3 CARDS) ---
    const stats = {
      completos: groupedData.filter(d => d.estado === "COMPLETO").length,
      enTurno: groupedData.filter(d => d.estado === "EN TURNO").length,
      sinFichar: groupedData.filter(d => d.estado === "SIN FICHAR").length
    };

    autoTable(doc, {
      startY: 50,
      head: [['TURNOS COMPLETOS', 'EN TURNO', 'SIN FICHAR']],
      body: [[stats.completos, stats.enTurno, stats.sinFichar]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], halign: 'center', fontSize: 9 },
      bodyStyles: { halign: 'center', fontSize: 14, fontStyle: 'bold' },
    });

    // --- RESUMEN DEL DÍA ---
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(12);
    doc.text("RESUMEN DEL DÍA", 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['COLABORADOR', 'ESTADO', 'ENTRADA', 'SALIDA', 'TOTAL HORAS']],
      body: groupedData.map(row => [
        row.staff.full_name,
        row.estado,
        row.primeraEntrada,
        row.ultimaSalida,
        row.horasTrabajadas
      ]),
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const estado = data.row.raw[1];
          if (estado === 'COMPLETO') data.cell.styles.fillColor = [209, 250, 229]; // emerald-100
          if (estado === 'EN TURNO') data.cell.styles.fillColor = [219, 234, 254]; // blue-100
        }
      },
      headStyles: { fillColor: [30, 58, 95] },
      styles: { fontSize: 8 },
    });

    // --- REGISTRO DETALLADO ---
    doc.addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(12);
    doc.text("REGISTRO DETALLADO", 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [['HORA', 'COLABORADOR', 'ACCIÓN', 'CANAL', 'UBICACIÓN', 'DISTANCIA', 'ESTADO GEO']],
      body: fichajesRow.map(f => {
        const geoStatus = getEstadoGeo(f.distance_meters, geoConfig.geo_radius);
        return [
          format(parseISO(f.timestamp), "HH:mm:ss"),
          f.staff?.full_name,
          f.tipo.toUpperCase(),
          f.canal.toUpperCase(),
          (f.address_text || "-").substring(0, 40),
          f.distance_meters != null ? `${f.distance_meters}m` : "-",
          geoStatus
        ];
      }),
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.raw;
          if (val === 'CORRECTO') data.cell.styles.textColor = [34, 197, 94];
          else if (val === 'INCORRECTO') data.cell.styles.textColor = [239, 68, 68];
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
      doc.text("Documento generado por SF · app.sffalcon.com", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
    }

    doc.save(`fichajes_${format(selectedDate, "yyyy-MM-dd")}_${organization.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrevDay = () => setSelectedDate(d => new Date(d.getTime() - 86400000));
  const handleNextDay = () => setSelectedDate(d => new Date(d.getTime() + 86400000));

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchStatus(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'SoporteFacil/1.0' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        setGeoConfig(prev => ({
          ...prev,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address_geocoded: result.display_name
        }));
        setAddressSearched(true);
        setSearchStatus({ type: 'success', msg: `Encontrada: ${result.display_name}` });
      } else {
        setSearchStatus({ type: 'error', msg: "Dirección no encontrada, intenta ser más específico" });
      }
    } catch (err) {
      setSearchStatus({ type: 'error', msg: "Error al buscar dirección" });
    } finally {
      setSearching(false);
    }
  };

  const handleSaveGeoConfig = async () => {
    if (!organization?.id) return;

    if (!addressSearched && searchQuery !== geoConfig.address_geocoded) {
      toast.error("Pulsa primero el botón Buscar para validar la dirección");
      return;
    }

    if (!geoConfig.latitude || !geoConfig.longitude) {
      alert("Busca primero la dirección del negocio");
      return;
    }
    setSavingConfig(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          latitude: geoConfig.latitude,
          longitude: geoConfig.longitude,
          geo_radius: geoConfig.geo_radius,
          address_geocoded: geoConfig.address_geocoded
        })
        .eq('id', organization.id);

      if (error) throw error;

      // Actualizar el estado local con los nuevos valores para reflejo inmediato
      setGeoConfig({
        latitude: geoConfig.latitude,
        longitude: geoConfig.longitude,
        geo_radius: geoConfig.geo_radius,
        address_geocoded: geoConfig.address_geocoded
      });

      setSearchStatus({ type: 'success', msg: "Ubicación del negocio guardada y actualizada" });
    } catch (err) {
      console.error(err);
      setSearchStatus({ type: 'error', msg: "Error al guardar la ubicación" });
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
      <div className="bg-white dark:bg-[#111F3A] p-5 sm:p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-500" />
            Panel de Fichajes
          </h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Control diario de entradas y salidas</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
            <button onClick={handlePrevDay} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-col items-center px-2 min-w-[100px]">
              <span className="text-xs font-black uppercase tracking-tighter whitespace-nowrap">
                {format(selectedDate, "d MMMM yyyy", { locale: es })}
              </span>
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all">
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            <FileText size={15} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Configuración de Ubicación */}
      <div className="bg-white dark:bg-[#111F3A] p-6 rounded-3xl shadow-lg border border-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="w-32 h-32 text-blue-500 rotate-12" />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          📍 Configuración de Ubicación del Negocio
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DIRECCIÓN DEL NEGOCIO</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setAddressSearched(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                  className="flex-1 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                  placeholder="Escribe la dirección del negocio..."
                />
                <button
                  onClick={handleSearchAddress}
                  disabled={searching}
                  className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {searchStatus && (
                <p className={cn(
                  "text-[10px] font-bold mt-1 ml-1",
                  searchStatus.type === 'success' ? "text-emerald-500" : "text-red-500"
                )}>
                  {searchStatus.type === 'success' ? "✅ " : "❌ "}{searchStatus.msg}
                </p>
              )}
            </div>

            {isMounted && geoConfig.latitude &&
              geoConfig.longitude &&
              !isNaN(geoConfig.latitude) &&
              !isNaN(geoConfig.longitude) && (
                <MapPicker
                  lat={geoConfig.latitude}
                  lng={geoConfig.longitude}
                  radius={geoConfig.geo_radius}
                  onLocationSelect={(lat: number, lng: number, address: string) => {
                    setGeoConfig(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      address_geocoded: address
                    }));
                    setSearchQuery(address);
                    setAddressSearched(true);
                    setSearchStatus({
                      type: 'success',
                      msg: "Ubicación seleccionada en mapa"
                    });
                  }}
                />
              )}

            {!geoConfig.latitude && (
              <div className="h-[300px] bg-slate-100 dark:bg-slate-800 
                rounded-2xl flex items-center justify-center">
                <p className="text-xs text-slate-400 font-bold uppercase 
                  tracking-widest text-center px-4">
                  Busca una dirección para ver el mapa
                </p>
              </div>
            )}
            <p className="text-[9px] font-bold text-slate-400 italic ml-1">
              Pincha en el mapa o arrastra el marcador para seleccionar la ubicación exacta del negocio
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RADIO MÁXIMO (METROS)</label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={geoConfig.geo_radius}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    setGeoConfig(prev => ({
                      ...prev,
                      geo_radius: isNaN(val) ? 200 : val
                    }))
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleSaveGeoConfig}
                  disabled={savingConfig || !geoConfig.latitude}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {savingConfig ? "Guardando..." : "Guardar configuración"}
                </button>
              </div>
            </div>

            {geoConfig.latitude && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">📍 Ubicación Guardada</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{geoConfig.address_geocoded}</p>
                <p className="text-[10px] font-black text-slate-400 mt-1">LAT: {geoConfig.latitude.toFixed(6)} | LNG: {geoConfig.longitude?.toFixed(6)} | Radio: {geoConfig.geo_radius}m</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12"><div className="animate-pulse">Cargando datos...</div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#111F3A] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Turnos Completos</h3>
              <p className="text-4xl font-black text-emerald-500">
                {groupedData.filter(d => d.estado === 'COMPLETO').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#111F3A] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">En Turno</h3>
              <p className="text-4xl font-black text-amber-500">
                {groupedData.filter(d => d.estado === 'EN TURNO').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#111F3A] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sin Fichar</h3>
              <p className="text-4xl font-black text-slate-400">
                {groupedData.filter(d => d.estado === 'SIN FICHAR').length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111F3A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Resumen del Día</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="p-4 border-b border-slate-200 dark:border-slate-800">Colaborador</th>
                    <th className="p-4 border-b border-slate-200 dark:border-slate-800">Estado</th>
                    <th className="p-4 border-b border-slate-200 dark:border-slate-800">Entrada</th>
                    <th className="p-4 border-b border-slate-200 dark:border-slate-800">Salida</th>
                    <th className="p-4 border-b border-slate-200 dark:border-slate-800">Total Horas</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {groupedData.map((row, idx) => (
                    <tr key={row.staff.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {row.staff.full_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{row.staff.full_name}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-widest",
                          row.estado === 'COMPLETO' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            row.estado === 'EN TURNO' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                              "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        )}>
                          {row.estado}
                        </span>
                      </td>
                      <td className="p-4 font-black">{row.primeraEntrada}</td>
                      <td className="p-4 font-black">{row.ultimaSalida}</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-black">{row.horasTrabajadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111F3A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Registro Detallado</h3>
              <p className="text-xs text-slate-500">{fichajesRow.length} eventos registrados hoy</p>
            </div>
            {fichajesRow.length > 0 ? (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-[#162040]">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-800">Hora</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-800">Colaborador</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-800">Acción</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-800">Canal</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-800">Ubicación</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-800">Estado Geo</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {fichajesRow.map(f => (
                      <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono text-xs">{format(parseISO(f.timestamp), "HH:mm:ss")}</td>
                        <td className="p-3 font-bold">{f.staff?.full_name}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-widest",
                            f.tipo === 'entrada' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                          )}>
                            {f.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-xs uppercase text-slate-400">{f.canal}</td>
                        <td className="p-3">
                          {f.address_text ? (
                            <div className="flex flex-col gap-0.5">
                              <p className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px]" title={f.address_text}>{f.address_text}</p>
                              <span className="text-[9px] font-black text-slate-400">
                                {f.distance_meters != null ? `${f.distance_meters}m` : "-"}
                              </span>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-1 rounded-[6px] text-[8px] font-black uppercase tracking-widest",
                            getEstadoGeo(f.distance_meters, geoConfig.geo_radius) === 'CORRECTO' ? "bg-emerald-500/10 text-emerald-500" :
                              getEstadoGeo(f.distance_meters, geoConfig.geo_radius) === 'INCORRECTO' ? "bg-red-500/10 text-red-500" :
                                "bg-slate-100 dark:bg-white/5 text-slate-400"
                          )}>
                            {getEstadoGeo(f.distance_meters, geoConfig.geo_radius)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                No hay movimientos hoy.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
