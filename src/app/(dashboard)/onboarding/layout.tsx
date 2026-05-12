import { OrganizationProvider } from "@/context/OrganizationContext";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  );
}
