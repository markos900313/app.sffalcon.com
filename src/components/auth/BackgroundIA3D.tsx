"use client";

import React from "react";
import Image from "next/image";

export const BackgroundIA3D = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Imagen de fondo global optimizada */}
      <Image
        src="/fondoSP.png"
        alt="Background"
        fill
        priority
        quality={100}
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: -2
        }}
      />
      
      {/* Overlay oscuro suave */}
      <div 
        className="absolute inset-0 bg-black/40"
        style={{
          zIndex: -1
        }}
      />
    </div>
  );
};
