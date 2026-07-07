"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from "@/lib/LanguageContext";

// Corregir iconos de Leaflet en Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  radius: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export default function MapPicker({ lat, lng, radius, onLocationSelect }: MapPickerProps) {
  const { t } = useLanguage();
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (!latNum || !lngNum || isNaN(latNum) || isNaN(lngNum)) {
    return (
      <div className="h-[300px] bg-slate-100 dark:bg-slate-800 
        rounded-2xl flex items-center justify-center">
        <p className="text-xs text-slate-400 font-bold uppercase 
          tracking-widest">{t('coordenadasNoDisponibles')}</p>
      </div>
    );
  }

  useEffect(() => {
    // Cargar CSS de Leaflet desde CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  function MapEvents() {
    useMapEvents({
      click: async (e: any) => {
        const { lat, lng } = e.latlng;
        await handleSelect(lat, lng);
      },
    });
    return null;
  }

  const handleSelect = async (newLat: number, newLng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`, {
        headers: { 'User-Agent': 'SoporteFacil/1.0' }
      });
      const data = await res.json();
      onLocationSelect(newLat, newLng, data.display_name || t('ubicacionSeleccionada'));
    } catch (err) {
      onLocationSelect(newLat, newLng, t('ubicacionSeleccionada'));
    }
  };

  const center: [number, number] = [latNum, lngNum];
  const zoom = 15;

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapEvents />
        <Marker 
          position={[latNum, lngNum]} 
          draggable={true}
          eventHandlers={{
            dragend: async (e: any) => {
              const marker = e.target;
              const position = marker.getLatLng();
              await handleSelect(position.lat, position.lng);
            },
          }}
        />
        <Circle 
          center={[latNum, lngNum]} 
          radius={!radius || isNaN(radius) ? 200 : radius}
          pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }}
        />
      </MapContainer>
    </div>
  );
}
