import { redirect } from "next/navigation";

export default function RootPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Si Supabase hace fallback a la URL base (por no tener la ruta en la whitelist),
  // atrapamos el código aquí y lo enviamos al callback para que pueda restablecer contraseñas
  if (searchParams?.code) {
    redirect(`/auth/callback?code=${searchParams.code}&next=/update-password`);
  }

  if (searchParams?.error) {
    redirect(`/login?error=${searchParams.error}`);
  }

  redirect("/login");
}

// ✅ app/page.tsx — responsive completado
