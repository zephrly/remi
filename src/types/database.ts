// Define the database schema types for Supabase

export interface UserRating {
  id: string;
  user_id: string;
  rated_user_id: string;
  interest_level: number;
  created_at: string;
  updated_at?: string;
}

export interface InviteLink {
  id: string;
  code: string;
  user_id: string;
  created_at: string;
  used: boolean;
  used_at?: string;
  used_by_user_id?: string;
}

export interface Connection {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "connected" | "declined" | "blocked";
  created_at: string;
  updated_at?: string;
}

// Define all table names for type safety
export type TableName =
  | "users"
  | "memories"
  | "connection_requests"
  | "connections"
  | "contacts"
  | "memory_comments"
  | "memory_photos"
  | "memory_tags"
  | "message_sessions"
  | "messages"
  | "notifications"
  | "profiles"
  | "timeline_events"
  | "user_ratings"
  | "invite_links";

// Type-safe table names
export type Tables = {
  user_ratings: UserRating;
  invite_links: InviteLink;
  connections: Connection;
};
