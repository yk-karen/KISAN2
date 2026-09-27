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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      community_messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          id: string
          media_url: string | null
          sender_id: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          sender_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_listings: {
        Row: {
          category: string
          created_at: string
          daily_rate: number
          description: string | null
          hourly_rate: number | null
          id: string
          images: string[]
          is_available: boolean
          location_address: string | null
          location_coords: Json | null
          owner_id: string
          specs: Json
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          daily_rate: number
          description?: string | null
          hourly_rate?: number | null
          id?: string
          images?: string[]
          is_available?: boolean
          location_address?: string | null
          location_coords?: Json | null
          owner_id: string
          specs?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          daily_rate?: number
          description?: string | null
          hourly_rate?: number | null
          id?: string
          images?: string[]
          is_available?: boolean
          location_address?: string | null
          location_coords?: Json | null
          owner_id?: string
          specs?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      government_schemes: {
        Row: {
          active: boolean
          application_deadline: string | null
          application_method: string | null
          benefits: string
          category: string
          created_at: string
          description: string
          eligibility_criteria: Json
          id: string
          official_apply_url: string | null
          official_link: string | null
          source_checked_at: string | null
          source_hash: string | null
          source_type: string
          source_updated_at: string | null
          source_url: string | null
          title: string
          verification_status: string
        }
        Insert: {
          active?: boolean
          application_deadline?: string | null
          application_method?: string | null
          benefits: string
          category: string
          created_at?: string
          description: string
          eligibility_criteria?: Json
          id?: string
          official_apply_url?: string | null
          official_link?: string | null
          source_checked_at?: string | null
          source_hash?: string | null
          source_type?: string
          source_updated_at?: string | null
          source_url?: string | null
          title: string
          verification_status?: string
        }
        Update: {
          active?: boolean
          application_deadline?: string | null
          application_method?: string | null
          benefits?: string
          category?: string
          created_at?: string
          description?: string
          eligibility_criteria?: Json
          id?: string
          official_apply_url?: string | null
          official_link?: string | null
          source_checked_at?: string | null
          source_hash?: string | null
          source_type?: string
          source_updated_at?: string | null
          source_url?: string | null
          title?: string
          verification_status?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          notes: string | null
          status: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          status?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string
          daily_wage: number
          date_required: string
          description: string | null
          farmer_id: string
          id: string
          location_address: string | null
          location_coords: Json | null
          skills_required: string[]
          status: string
          title: string
          updated_at: string
          workers_hired: number
          workers_needed: number
        }
        Insert: {
          created_at?: string
          daily_wage: number
          date_required: string
          description?: string | null
          farmer_id: string
          id?: string
          location_address?: string | null
          location_coords?: Json | null
          skills_required?: string[]
          status?: string
          title: string
          updated_at?: string
          workers_hired?: number
          workers_needed?: number
        }
        Update: {
          created_at?: string
          daily_wage?: number
          date_required?: string
          description?: string | null
          farmer_id?: string
          id?: string
          location_address?: string | null
          location_coords?: Json | null
          skills_required?: string[]
          status?: string
          title?: string
          updated_at?: string
          workers_hired?: number
          workers_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          payload: Json
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          payload?: Json
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          payload?: Json
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          crops: string[]
          equipment_types: string[]
          farm_size_range: string | null
          full_name: string
          id: string
          interests: string[]
          language: string
          location: Json | null
          metadata: Json
          onboarding_completed: boolean
          phone: string | null
          role: string
          storage_types: string[]
          work_skills: string[]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crops?: string[]
          equipment_types?: string[]
          farm_size_range?: string | null
          full_name: string
          id: string
          interests?: string[]
          language?: string
          location?: Json | null
          metadata?: Json
          onboarding_completed?: boolean
          phone?: string | null
          role: string
          storage_types?: string[]
          work_skills?: string[]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crops?: string[]
          equipment_types?: string[]
          farm_size_range?: string | null
          full_name?: string
          id?: string
          interests?: string[]
          language?: string
          location?: Json | null
          metadata?: Json
          onboarding_completed?: boolean
          phone?: string | null
          role?: string
          storage_types?: string[]
          work_skills?: string[]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          service_request_id: string | null
          target_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          service_request_id?: string | null
          target_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          service_request_id?: string | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string
          end_date: string
          id: string
          item_id: string
          item_type: string
          notes: string | null
          provider_id: string
          quantity_tons: number | null
          requester_id: string
          start_date: string
          status: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          item_id: string
          item_type: string
          notes?: string | null
          provider_id: string
          quantity_tons?: number | null
          requester_id: string
          start_date: string
          status?: string
          total_cost: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          item_id?: string
          item_type?: string
          notes?: string | null
          provider_id?: string
          quantity_tons?: number | null
          requester_id?: string
          start_date?: string
          status?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_listings: {
        Row: {
          available_capacity_tons: number
          created_at: string
          features: string[]
          id: string
          images: string[]
          location_address: string | null
          location_coords: Json | null
          name: string
          owner_id: string
          rate_per_ton_day: number
          storage_type: string
          total_capacity_tons: number
          updated_at: string
        }
        Insert: {
          available_capacity_tons: number
          created_at?: string
          features?: string[]
          id?: string
          images?: string[]
          location_address?: string | null
          location_coords?: Json | null
          name: string
          owner_id: string
          rate_per_ton_day: number
          storage_type: string
          total_capacity_tons: number
          updated_at?: string
        }
        Update: {
          available_capacity_tons?: number
          created_at?: string
          features?: string[]
          id?: string
          images?: string[]
          location_address?: string | null
          location_coords?: Json | null
          name?: string
          owner_id?: string
          rate_per_ton_day?: number
          storage_type?: string
          total_capacity_tons?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
