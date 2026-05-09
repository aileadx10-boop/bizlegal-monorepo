import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialize the clients so module-load doesn't throw during Vercel
// build-time page-data collection (env vars only present at runtime).
// Call `getSupabase()` / `getSupabaseAdmin()` inside route handlers.

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function readEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    throw new Error("Missing Supabase environment variables.");
  }
  return { url, anon, service };
}

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const { url, anon } = readEnv();
  _supabase = createClient(url, anon);
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;
  const { url, service } = readEnv();
  _supabaseAdmin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabaseAdmin;
}

// Backwards-compatible Proxy exports — existing call sites that read
// `supabaseAdmin.from(...)` keep working without diff churn. The Proxy
// defers initialization until first property access at runtime, so the
// env check never runs at module load.
type Sb = SupabaseClient;

function lazyClient(getter: () => Sb): Sb {
  return new Proxy({} as Sb, {
    get(_t, prop) {
      const real = getter() as unknown as Record<string | symbol, unknown>;
      const v = real[prop];
      return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(real) : v;
    },
  });
}

export const supabase: Sb = lazyClient(getSupabase);
export const supabaseAdmin: Sb = lazyClient(getSupabaseAdmin);
