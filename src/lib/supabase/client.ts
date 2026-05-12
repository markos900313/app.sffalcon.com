import { createBrowserClient } from '@supabase/ssr'

let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (_supabaseClient) return _supabaseClient

  _supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: '/',
        // En localhost no podemos usar secure cookies a menos que tengas HTTPS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }
    }
  )

  return _supabaseClient
}
