import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";

// Define a more flexible type for table operations that won't cause TypeScript errors
export type TableOperations = {
  select: () => any;
  insert: (data: any) => any;
  update: (data: any) => any;
  delete: () => any;
};

// Enhanced Supabase client with custom table methods
export type EnhancedSupabaseClient = SupabaseClient<Database> & {
  userRatings: TableOperations;
  inviteLinks: TableOperations;
  connections: TableOperations;
  // Add any future custom tables here
};
