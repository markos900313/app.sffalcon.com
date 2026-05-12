import { Metadata, Viewport } from "next";
import { SidebarProvider } from "./SidebarContext";
import PanelEmpleadoClientLayout from "./PanelEmpleadoClientLayout";
import ServiceWorkerRegister from './ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'SF',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SF',
  },
  icons: {
    apple: '/icon-192.png',
  },
  other: {
    "apple-mobile-web-app-title": "SF",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: '#1B4FD8',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <SidebarProvider>
        <PanelEmpleadoClientLayout>
          {children}
        </PanelEmpleadoClientLayout>
      </SidebarProvider>
    </>
  );
}
