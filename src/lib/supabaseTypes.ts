import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { UserRating, InviteLink, Connection } from "@/types/database";

// Enhanced Supabase client with custom table methods
export type EnhancedSupabaseClient = SupabaseClient<Database> & {
  // Custom typed methods for tables not in the generated types
  userRatings: {
    select: () => ReturnType<SupabaseClient<Database>["from"]>;
    insert: (
      data: Partial<UserRating> | Partial<UserRating>[],
    ) => ReturnType<SupabaseClient<Database>["from"]>;
    update: (
      data: Partial<UserRating>,
    ) => ReturnType<SupabaseClient<Database>["from"]>;
    delete: () => ReturnType<SupabaseClient<Database>["from"]>;
  };
  inviteLinks: {
    select: () => ReturnType<SupabaseClient<Database>["from"]>;
    insert: (
      data: Partial<InviteLink> | Partial<InviteLink>[],
    ) => ReturnType<SupabaseClient<Database>["from"]>;
    update: (
      data: Partial<InviteLink>,
    ) => ReturnType<SupabaseClient<Database>["from"]>;
    delete: () => ReturnType<SupabaseClient<Database>["from"]>;
  };
  connections: {
    select: () => ReturnType<SupabaseClient<Database>["from"]>;
    insert: (
      data: Partial<Connection> | Partial<Connection>[],
    ) => ReturnType<SupabaseClient<Database>["from"]>;
    update: (
      data: Partial<Connection>,
    ) => ReturnType<SupabaseClient<Database>["from"]>;
    delete: () => ReturnType<SupabaseClient<Database>["from"]>;
  };
};

// Enhance the Supabase client with custom table methods
export function enhanceSupabaseClient(
  client: SupabaseClient<Database>,
): EnhancedSupabaseClient {
  const enhanced = client as EnhancedSupabaseClient;

  // Add userRatings methods
  enhanced.userRatings = {
    select: () => client.from("user_ratings"),
    insert: (data) => client.from("user_ratings").insert(data),
    update: (data) => client.from("user_ratings").update(data),
    delete: () => client.from("user_ratings").delete(),
  };

  // Add inviteLinks methods
  enhanced.inviteLinks = {
    select: () => client.from("invite_links"),
    insert: (data) => client.from("invite_links").insert(data),
    update: (data) => client.from("invite_links").update(data),
    delete: () => client.from("invite_links").delete(),
  };

  // Add connections methods
  enhanced.connections = {
    select: () => client.from("connections"),
    insert: (data) => client.from("connections").insert(data),
    update: (data) => client.from("connections").update(data),
    delete: () => client.from("connections").delete(),
  };

  return enhanced;
}
