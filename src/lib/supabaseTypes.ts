import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { UserRating, InviteLink, Connection } from "@/types/database";

// Enhanced Supabase client with custom table methods
export type EnhancedSupabaseClient = SupabaseClient & {
  // Custom typed methods for tables not in the generated types
  userRatings: {
    select: () => ReturnType<SupabaseClient["from"]>;
    insert: (
      data: Partial<UserRating> | Partial<UserRating>[],
    ) => ReturnType<SupabaseClient["from"]>;
    update: (data: Partial<UserRating>) => ReturnType<SupabaseClient["from"]>;
  };
  inviteLinks: {
    select: () => ReturnType<SupabaseClient["from"]>;
    insert: (
      data: Partial<InviteLink> | Partial<InviteLink>[],
    ) => ReturnType<SupabaseClient["from"]>;
    update: (data: Partial<InviteLink>) => ReturnType<SupabaseClient["from"]>;
  };
  connections: {
    select: () => ReturnType<SupabaseClient["from"]>;
    insert: (
      data: Partial<Connection> | Partial<Connection>[],
    ) => ReturnType<SupabaseClient["from"]>;
    update: (data: Partial<Connection>) => ReturnType<SupabaseClient["from"]>;
  };
};

// Enhance the Supabase client with custom table methods
export function enhanceSupabaseClient(
  client: SupabaseClient,
): EnhancedSupabaseClient {
  const enhanced = client as EnhancedSupabaseClient;

  // Add userRatings methods
  enhanced.userRatings = {
    select: () => client.from("user_ratings"),
    insert: (data) => client.from("user_ratings").insert(data),
    update: (data) => client.from("user_ratings").update(data),
  };

  // Add inviteLinks methods
  enhanced.inviteLinks = {
    select: () => client.from("invite_links"),
    insert: (data) => client.from("invite_links").insert(data),
    update: (data) => client.from("invite_links").update(data),
  };

  // Add connections methods
  enhanced.connections = {
    select: () => client.from("connections"),
    insert: (data) => client.from("connections").insert(data),
    update: (data) => client.from("connections").update(data),
  };

  return enhanced;
}
