import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { enhanceSupabaseClient } from "./supabaseTypes";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const standardClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const supabase = enhanceSupabaseClient(standardClient);
