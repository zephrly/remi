export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      connection_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          recipient_id: string
          sender_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id: string
          sender_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          avatar: string | null
          connection_status: string | null
          created_at: string | null
          email: string | null
          has_account: boolean | null
          id: string
          name: string
          phone: string | null
          source: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar?: string | null
          connection_status?: string | null
          created_at?: string | null
          email?: string | null
          has_account?: boolean | null
          id?: string
          name: string
          phone?: string | null
          source: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar?: string | null
          connection_status?: string | null
          created_at?: string | null
          email?: string | null
          has_account?: boolean | null
          id?: string
          name?: string
          phone?: string | null
          source?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          code: string
          created_at: string | null
          id: string
          used: boolean | null
          used_at: string | null
          used_by_user_id: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          used_by_user_id?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          used_by_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          is_private: boolean | null
          memory_text: string
          prompt: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          is_private?: boolean | null
          memory_text: string
          prompt: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          is_private?: boolean | null
          memory_text?: string
          prompt?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      memory_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          memory_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          memory_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          memory_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_comments_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_photos: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string
          photo_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id: string
          photo_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_photos_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_tags: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_tags_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      message_sessions: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          last_message_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          last_message_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          last_message_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          session_id: string | null
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          session_id?: string | null
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          session_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "message_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          related_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          invited_by_user_id: string | null
          state: string | null
          updated_at: string | null
          username: string | null
          zip_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          invited_by_user_id?: string | null
          state?: string | null
          updated_at?: string | null
          username?: string | null
          zip_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          invited_by_user_id?: string | null
          state?: string | null
          updated_at?: string | null
          username?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_private: boolean | null
          location: string | null
          start_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_private?: boolean | null
          location?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          created_at: string | null
          id: string
          interest_level: number
          rated_user_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_level: number
          rated_user_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_level?: number
          rated_user_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          middle_name: string | null
          phone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          middle_name?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
