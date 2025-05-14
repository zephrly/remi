import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import {
  EnhancedSupabaseClient,
  TableOperations,
} from "@/types/enhanced-supabase";

/**
 * Creates a type-safe wrapper for a table that isn't in the generated types
 * @param client The Supabase client
 * @param tableName The name of the table
 * @returns Object with CRUD methods for the table
 */
function createTableOperations(
  client: SupabaseClient<Database>,
  tableName: string,
): TableOperations {
  return {
    select: () => client.from(tableName as any),
    insert: (data: any) => client.from(tableName as any).insert(data),
    update: (data: any) => client.from(tableName as any).update(data),
    delete: () => client.from(tableName as any).delete(),
  };
}

/**
 * Enhances the Supabase client with custom table methods
 * @param client The standard Supabase client
 * @returns Enhanced client with additional table methods
 */
export function enhanceSupabaseClient(
  client: SupabaseClient<Database>,
): EnhancedSupabaseClient {
  const enhanced = client as EnhancedSupabaseClient;

  // Add custom table operations
  enhanced.userRatings = createTableOperations(client, "user_ratings");
  enhanced.inviteLinks = createTableOperations(client, "invite_links");
  enhanced.connections = createTableOperations(client, "connections");

  return enhanced;
}
