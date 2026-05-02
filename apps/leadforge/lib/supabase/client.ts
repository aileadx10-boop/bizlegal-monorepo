import { createClient } from "@supabase/supabase-js";

function getPublicEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }

  return value;
}

export function createBrowserSupabaseClient() {
  return createClient(
    getPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
