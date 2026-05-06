export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          capacity: number
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          hidden: boolean
          host_id: string
          id: string
          is_paid: boolean
          location_text: string | null
          online_url: string | null
          starts_at: string
          state: Database["public"]["Enums"]["event_state"]
          timezone: string
          title: string
          updated_at: string
          venue: string | null
          visibility: Database["public"]["Enums"]["event_visibility"]
        }
        Insert: {
          capacity?: number
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          hidden?: boolean
          host_id: string
          id?: string
          is_paid?: boolean
          location_text?: string | null
          online_url?: string | null
          starts_at: string
          state?: Database["public"]["Enums"]["event_state"]
          timezone?: string
          title: string
          updated_at?: string
          venue?: string | null
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Update: {
          capacity?: number
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          hidden?: boolean
          host_id?: string
          id?: string
          is_paid?: boolean
          location_text?: string | null
          online_url?: string | null
          starts_at?: string
          state?: Database["public"]["Enums"]["event_state"]
          timezone?: string
          title?: string
          updated_at?: string
          venue?: string | null
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["gallery_status"]
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["gallery_status"]
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["gallery_status"]
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      host_invites: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          host_id: string
          id: string
          role: Database["public"]["Enums"]["host_role"]
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          host_id: string
          id?: string
          role: Database["public"]["Enums"]["host_role"]
          token?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          host_id?: string
          id?: string
          role?: Database["public"]["Enums"]["host_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_invites_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      host_members: {
        Row: {
          created_at: string
          host_id: string
          id: string
          role: Database["public"]["Enums"]["host_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          host_id: string
          id?: string
          role: Database["public"]["Enums"]["host_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          role?: Database["public"]["Enums"]["host_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_members_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      hosts: {
        Row: {
          bio: string | null
          contact_email: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          host_id: string | null
          id: string
          rating: number | null
          reason: string | null
          reporter_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Insert: {
          created_at?: string
          host_id?: string | null
          id?: string
          rating?: number | null
          reason?: string | null
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Update: {
          created_at?: string
          host_id?: string | null
          id?: string
          rating?: number | null
          reason?: string | null
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["rsvp_status"]
          ticket_code: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          status: Database["public"]["Enums"]["rsvp_status"]
          ticket_code?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
          ticket_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      event_is_managed_by: {
        Args: { _event: string; _user: string }
        Returns: boolean
      }
      get_approved_event_feedback: {
        Args: { _event_id: string }
        Returns: {
          comment: string
          created_at: string
          event_id: string
          id: string
          rating: number
          reporter_id: string
          reporter_name: string
        }[]
      }
      get_events_ratings: {
        Args: { _event_ids: string[] }
        Returns: {
          avg_rating: number
          event_id: string
          rating_count: number
        }[]
      }
      is_host_manager: {
        Args: { _host: string; _user: string }
        Returns: boolean
      }
      is_host_member: {
        Args: {
          _host: string
          _role: Database["public"]["Enums"]["host_role"]
          _user: string
        }
        Returns: boolean
      }
      is_host_team: { Args: { _host: string; _user: string }; Returns: boolean }
    }
    Enums: {
      event_state: "draft" | "published" | "unpublished"
      event_visibility: "public" | "unlisted"
      gallery_status: "pending" | "approved" | "rejected"
      host_role: "host" | "checker"
      report_status: "open" | "hidden" | "dismissed" | "approved"
      report_target: "event" | "gallery_photo"
      rsvp_status: "confirmed" | "waitlisted" | "cancelled"
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
      event_state: ["draft", "published", "unpublished"],
      event_visibility: ["public", "unlisted"],
      gallery_status: ["pending", "approved", "rejected"],
      host_role: ["host", "checker"],
      report_status: ["open", "hidden", "dismissed", "approved"],
      report_target: ["event", "gallery_photo"],
      rsvp_status: ["confirmed", "waitlisted", "cancelled"],
    },
  },
} as const
