import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Warn loudly but don't crash: a missing env would otherwise throw at
  // module-eval and break the static-export prerender (`next build`).
  // Production builds bake the real values in; this only trips when
  // .env.local is absent locally.
  console.warn(
    '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — ' +
      'using placeholder values. Auth and data will not work until you add them to .env.local.',
  )
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
