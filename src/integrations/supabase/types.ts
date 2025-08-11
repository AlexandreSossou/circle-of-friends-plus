export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_activities: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      chat_moderation: {
        Row: {
          ai_confidence: number | null
          created_at: string
          flagged_content: string
          id: string
          message_id: string | null
          moderator_action: string | null
          moderator_id: string | null
          moderator_reviewed: boolean | null
          severity_level: string
          updated_at: string
          user_id: string
          violation_type: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string
          flagged_content: string
          id?: string
          message_id?: string | null
          moderator_action?: string | null
          moderator_id?: string | null
          moderator_reviewed?: boolean | null
          severity_level?: string
          updated_at?: string
          user_id: string
          violation_type: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string
          flagged_content?: string
          id?: string
          message_id?: string | null
          moderator_action?: string | null
          moderator_id?: string | null
          moderator_reviewed?: boolean | null
          severity_level?: string
          updated_at?: string
          user_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_moderation_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string
          time: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date: string
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          relationship_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          relationship_type?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          relationship_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_preferences: {
        Row: {
          allow_gender: string[] | null
          allow_marital_status: string[] | null
          allow_messages: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_gender?: string[] | null
          allow_marital_status?: string[] | null
          allow_messages?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_gender?: string[] | null
          allow_marital_status?: string[] | null
          allow_messages?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          moderation_id: string | null
          read: boolean | null
          recipient_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          moderation_id?: string | null
          read?: boolean | null
          recipient_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          moderation_id?: string | null
          read?: boolean | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_notifications_moderation_id_fkey"
            columns: ["moderation_id"]
            isOneToOne: false
            referencedRelation: "chat_moderation"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_id: string
          author_name: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          source: string
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          source?: string
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          source?: string
          source_url?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_limits: {
        Row: {
          created_at: string
          daily_limit: number
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          daily_limit?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          daily_limit?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tagged_by_user_id: string
          tagged_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tagged_by_user_id: string
          tagged_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tagged_by_user_id?: string
          tagged_user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_global: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_global?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_global?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          banned_by: string | null
          banned_reason: string | null
          banned_until: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_banned: boolean | null
          location: string | null
          looking_for: string[] | null
          marital_status: string | null
          partner_id: string | null
          partners: string[] | null
          private_marital_status: string | null
          private_partner_id: string | null
          private_partners: string[] | null
          updated_at: string
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_banned?: boolean | null
          location?: string | null
          looking_for?: string[] | null
          marital_status?: string | null
          partner_id?: string | null
          partners?: string[] | null
          private_marital_status?: string | null
          private_partner_id?: string | null
          private_partners?: string[] | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_banned?: boolean | null
          location?: string | null
          looking_for?: string[] | null
          marital_status?: string | null
          partner_id?: string | null
          partners?: string[] | null
          private_marital_status?: string | null
          private_partner_id?: string | null
          private_partners?: string[] | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_preferences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          rating: number
          reviewed_user_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rating: number
          reviewed_user_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rating?: number
          reviewed_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      travels: {
        Row: {
          arrival_date: string
          city: string
          country: string
          created_at: string
          departure_date: string
          description: string | null
          id: string
          looking_for: string
          traveling_with_partner: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          arrival_date: string
          city: string
          country: string
          created_at?: string
          departure_date: string
          description?: string | null
          id?: string
          looking_for: string
          traveling_with_partner?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          arrival_date?: string
          city?: string
          country?: string
          created_at?: string
          departure_date?: string
          description?: string | null
          id?: string
          looking_for?: string
          traveling_with_partner?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          acknowledged: boolean | null
          created_at: string
          id: string
          moderation_id: string | null
          user_id: string
          warning_message: string
          warning_type: string
        }
        Insert: {
          acknowledged?: boolean | null
          created_at?: string
          id?: string
          moderation_id?: string | null
          user_id: string
          warning_message: string
          warning_type: string
        }
        Update: {
          acknowledged?: boolean | null
          created_at?: string
          id?: string
          moderation_id?: string | null
          user_id?: string
          warning_message?: string
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warnings_moderation_id_fkey"
            columns: ["moderation_id"]
            isOneToOne: false
            referencedRelation: "chat_moderation"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_safe_profile: {
        Args: { profile_id: string }
        Returns: {
          id: string
          created_at: string
          updated_at: string
          age: number
          partner_id: string
          partners: string[]
          private_partner_id: string
          private_partners: string[]
          is_banned: boolean
          banned_until: string
          banned_by: string
          username: string
          full_name: string
          avatar_url: string
          bio: string
          location: string
          gender: string
          marital_status: string
          private_marital_status: string
          looking_for: string[]
          banned_reason: string
          email: string
        }[]
      }
      get_safe_profiles_list: {
        Args: { profile_ids?: string[] }
        Returns: {
          id: string
          created_at: string
          updated_at: string
          age: number
          partner_id: string
          partners: string[]
          private_partner_id: string
          private_partners: string[]
          is_banned: boolean
          banned_until: string
          banned_by: string
          username: string
          full_name: string
          avatar_url: string
          bio: string
          location: string
          gender: string
          marital_status: string
          private_marital_status: string
          looking_for: string[]
          banned_reason: string
          email: string
        }[]
      }
      test_user_creation: {
        Args: Record<PropertyKey, never>
        Returns: {
          profiles_count: number
          user_roles_count: number
          trigger_exists: boolean
        }[]
      }
      validate_content_input: {
        Args: { content_text: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
