import { createClient } from "@supabase/supabase-js";

// ⚠️ Usa le tue variabili reali da Project Settings > API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Crea il client tipizzato
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
