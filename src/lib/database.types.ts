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
      app_settings: {
        Row: {
          cgv_note: string
          credit_note_prefix: string
          footer_legal: string
          id: string
          invoice_prefix: string
          issuer_address: string
          issuer_bank: string
          issuer_bce: string
          issuer_bic: string
          issuer_email: string
          issuer_iban: string
          issuer_legal_name: string
          issuer_name: string
          issuer_phone: string
          logo_data_uri: string | null
          payment_terms_days: number
          updated_at: string
          vat_note: string
        }
        Insert: {
          cgv_note?: string
          credit_note_prefix?: string
          footer_legal?: string
          id?: string
          invoice_prefix?: string
          issuer_address: string
          issuer_bank?: string
          issuer_bce: string
          issuer_bic: string
          issuer_email?: string
          issuer_iban: string
          issuer_legal_name: string
          issuer_name: string
          issuer_phone?: string
          logo_data_uri?: string | null
          payment_terms_days?: number
          updated_at?: string
          vat_note: string
        }
        Update: {
          cgv_note?: string
          credit_note_prefix?: string
          footer_legal?: string
          id?: string
          invoice_prefix?: string
          issuer_address?: string
          issuer_bank?: string
          issuer_bce?: string
          issuer_bic?: string
          issuer_email?: string
          issuer_iban?: string
          issuer_legal_name?: string
          issuer_name?: string
          issuer_phone?: string
          logo_data_uri?: string | null
          payment_terms_days?: number
          updated_at?: string
          vat_note?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_counters: {
        Row: {
          kind: Database["public"]["Enums"]["invoice_kind"]
          last_number: number
          year: number
        }
        Insert: {
          kind: Database["public"]["Enums"]["invoice_kind"]
          last_number?: number
          year: number
        }
        Update: {
          kind?: Database["public"]["Enums"]["invoice_kind"]
          last_number?: number
          year?: number
        }
        Relationships: []
      }
      groups: {
        Row: {
          coach_id: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          label: string | null
          notes: string | null
          size: number | null
          slot_id: string
          starts_on: string | null
          status: Database["public"]["Enums"]["group_status"]
          updated_at: string
        }
        Insert: {
          coach_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          label?: string | null
          notes?: string | null
          size?: number | null
          slot_id: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["group_status"]
          updated_at?: string
        }
        Update: {
          coach_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          label?: string | null
          notes?: string | null
          size?: number | null
          slot_id?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["group_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          amount_cents: number
          created_at: string
          description: string
          discount_cents: number
          id: string
          invoice_id: string
          position: number
          promo_code: string | null
          quantity: number
          registration_id: string | null
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description: string
          discount_cents?: number
          id?: string
          invoice_id: string
          position?: number
          promo_code?: string | null
          quantity?: number
          registration_id?: string | null
          unit_price_cents: number
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string
          discount_cents?: number
          id?: string
          invoice_id?: string
          position?: number
          promo_code?: string | null
          quantity?: number
          registration_id?: string | null
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billed_to_org_id: string | null
          billed_to_profile_id: string
          created_at: string
          due_on: string | null
          group_id: string | null
          id: string
          issued_on: string
          issuer_snapshot: Json
          kind: Database["public"]["Enums"]["invoice_kind"]
          notes: string | null
          number: string | null
          paid_at: string | null
          parent_invoice_id: string | null
          recipient_snapshot: Json
          season_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          structured_comm: string | null
          total_cents: number
          updated_at: string
          vat_note: string
        }
        Insert: {
          billed_to_org_id?: string | null
          billed_to_profile_id: string
          created_at?: string
          due_on?: string | null
          group_id?: string | null
          id?: string
          issued_on?: string
          issuer_snapshot?: Json
          kind?: Database["public"]["Enums"]["invoice_kind"]
          notes?: string | null
          number?: string | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          recipient_snapshot?: Json
          season_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          structured_comm?: string | null
          total_cents?: number
          updated_at?: string
          vat_note?: string
        }
        Update: {
          billed_to_org_id?: string | null
          billed_to_profile_id?: string
          created_at?: string
          due_on?: string | null
          group_id?: string | null
          id?: string
          issued_on?: string
          issuer_snapshot?: Json
          kind?: Database["public"]["Enums"]["invoice_kind"]
          notes?: string | null
          number?: string | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          recipient_snapshot?: Json
          season_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          structured_comm?: string | null
          total_cents?: number
          updated_at?: string
          vat_note?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_billed_to_org_id_fkey"
            columns: ["billed_to_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_billed_to_profile_id_fkey"
            columns: ["billed_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      padel_levels: {
        Row: {
          code: string
          label: string
          rank: number
        }
        Insert: {
          code: string
          label: string
          rank: number
        }
        Update: {
          code?: string
          label?: string
          rank?: number
        }
        Relationships: []
      }
      players: {
        Row: {
          birthdate: string
          created_at: string
          email: string
          first_name: string
          id: string
          image_consent: boolean
          invitation_status: Database["public"]["Enums"]["invitation_status"]
          last_name: string
          level_code: string
          managed_by: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          birthdate: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          image_consent: boolean
          invitation_status?: Database["public"]["Enums"]["invitation_status"]
          last_name: string
          level_code: string
          managed_by: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          birthdate?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          image_consent?: boolean
          invitation_status?: Database["public"]["Enums"]["invitation_status"]
          last_name?: string
          level_code?: string
          managed_by?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "padel_levels"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "players_managed_by_fkey"
            columns: ["managed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tiers: {
        Row: {
          active: boolean
          amount_cents: number
          created_at: string
          duration_minutes: number | null
          group_size: number | null
          id: string
          kind: Database["public"]["Enums"]["price_tier_kind"]
          label: string
          position: number
          product_id: string
          session_count: number | null
          updated_at: string
          variant: string | null
        }
        Insert: {
          active?: boolean
          amount_cents: number
          created_at?: string
          duration_minutes?: number | null
          group_size?: number | null
          id?: string
          kind: Database["public"]["Enums"]["price_tier_kind"]
          label: string
          position?: number
          product_id: string
          session_count?: number | null
          updated_at?: string
          variant?: string | null
        }
        Update: {
          active?: boolean
          amount_cents?: number
          created_at?: string
          duration_minutes?: number | null
          group_size?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["price_tier_kind"]
          label?: string
          position?: number
          product_id?: string
          session_count?: number | null
          updated_at?: string
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          default_session_count: number | null
          default_session_minutes: number
          description: string | null
          id: string
          name: string
          position: number
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          default_session_count?: number | null
          default_session_minutes?: number
          description?: string | null
          id?: string
          name: string
          position?: number
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          default_session_count?: number | null
          default_session_minutes?: number
          description?: string | null
          id?: string
          name?: string
          position?: number
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line: string | null
          city: string | null
          country: string
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          notif_prefs: Json
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country?: string
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          notif_prefs?: Json
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country?: string
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notif_prefs?: Json
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          amount_cents: number
          code: string
          created_at: string
          id: string
          product_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount_cents: number
          code: string
          created_at?: string
          id?: string
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount_cents?: number
          code?: string
          created_at?: string
          id?: string
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          billed_to_org_id: string | null
          billed_to_profile_id: string
          cancel_requested_at: string | null
          created_at: string
          group_id: string | null
          id: string
          level_mismatch: boolean
          notes: string | null
          player_id: string
          promo_code: string | null
          prorata_sessions: number | null
          requested_at: string
          season_id: string
          slot_id: string
          status: Database["public"]["Enums"]["registration_status"]
          unit_price_cents: number | null
          updated_at: string
        }
        Insert: {
          billed_to_org_id?: string | null
          billed_to_profile_id: string
          cancel_requested_at?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          level_mismatch?: boolean
          notes?: string | null
          player_id: string
          promo_code?: string | null
          prorata_sessions?: number | null
          requested_at?: string
          season_id: string
          slot_id: string
          status?: Database["public"]["Enums"]["registration_status"]
          unit_price_cents?: number | null
          updated_at?: string
        }
        Update: {
          billed_to_org_id?: string | null
          billed_to_profile_id?: string
          cancel_requested_at?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          level_mismatch?: boolean
          notes?: string | null
          player_id?: string
          promo_code?: string | null
          prorata_sessions?: number | null
          requested_at?: string
          season_id?: string
          slot_id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          unit_price_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_billed_to_org_id_fkey"
            columns: ["billed_to_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_billed_to_profile_id_fkey"
            columns: ["billed_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          name: string
          registration_closes_on: string | null
          registration_opens_on: string | null
          starts_on: string
          status: Database["public"]["Enums"]["season_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          name: string
          registration_closes_on?: string | null
          registration_opens_on?: string | null
          starts_on: string
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          registration_closes_on?: string | null
          registration_opens_on?: string | null
          starts_on?: string
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Relationships: []
      }
      slots: {
        Row: {
          capacity: number
          coach_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          level_note: string | null
          location_id: string | null
          max_level_code: string | null
          min_level_code: string | null
          notes: string | null
          product_id: string
          season_id: string
          session_count: number
          start_time: string
          starts_on: string | null
          status: Database["public"]["Enums"]["slot_status"]
          updated_at: string
          weekday: number
        }
        Insert: {
          capacity?: number
          coach_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          level_note?: string | null
          location_id?: string | null
          max_level_code?: string | null
          min_level_code?: string | null
          notes?: string | null
          product_id: string
          season_id: string
          session_count?: number
          start_time: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["slot_status"]
          updated_at?: string
          weekday: number
        }
        Update: {
          capacity?: number
          coach_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          level_note?: string | null
          location_id?: string | null
          max_level_code?: string | null
          min_level_code?: string | null
          notes?: string | null
          product_id?: string
          season_id?: string
          session_count?: number
          start_time?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["slot_status"]
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "slots_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slots_max_level_code_fkey"
            columns: ["max_level_code"]
            isOneToOne: false
            referencedRelation: "padel_levels"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "slots_min_level_code_fkey"
            columns: ["min_level_code"]
            isOneToOne: false
            referencedRelation: "padel_levels"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "slots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slots_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      group_roster: {
        Args: { p_group_id: string }
        Returns: {
          first_name: string
          level_code: string
          level_mismatch: boolean
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      next_document_number: {
        Args: { p_kind: Database["public"]["Enums"]["invoice_kind"] }
        Returns: number
      }
    }
    Enums: {
      app_role: "client" | "coach" | "admin"
      group_status: "forming" | "confirmed"
      invitation_status: "none" | "pending" | "accepted"
      invoice_kind: "invoice" | "credit_note"
      invoice_status: "draft" | "sent" | "paid" | "cancelled"
      price_tier_kind: "group_size" | "duration" | "unit" | "flat"
      pricing_model: "per_group_size" | "per_duration" | "unit" | "flat"
      product_category:
        | "cycle_adulte"
        | "cycle_enfant"
        | "stage"
        | "ete_indien"
        | "cours_prive"
      registration_status:
        | "demande_recue"
        | "groupe_constitue"
        | "validee"
        | "facturee"
        | "payee"
        | "annulee"
      season_status: "draft" | "active" | "archived"
      slot_status: "draft" | "open" | "closed"
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
    Enums: {
      app_role: ["client", "coach", "admin"],
      group_status: ["forming", "confirmed"],
      invitation_status: ["none", "pending", "accepted"],
      invoice_kind: ["invoice", "credit_note"],
      invoice_status: ["draft", "sent", "paid", "cancelled"],
      price_tier_kind: ["group_size", "duration", "unit", "flat"],
      pricing_model: ["per_group_size", "per_duration", "unit", "flat"],
      product_category: [
        "cycle_adulte",
        "cycle_enfant",
        "stage",
        "ete_indien",
        "cours_prive",
      ],
      registration_status: [
        "demande_recue",
        "groupe_constitue",
        "validee",
        "facturee",
        "payee",
        "annulee",
      ],
      season_status: ["draft", "active", "archived"],
      slot_status: ["draft", "open", "closed"],
    },
  },
} as const
