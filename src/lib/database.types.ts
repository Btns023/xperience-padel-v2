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
      attendance: {
        Row: {
          id: string
          marked_by: string | null
          present: boolean
          registration_id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          marked_by?: string | null
          present: boolean
          registration_id: string
          session_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          marked_by?: string | null
          present?: boolean
          registration_id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_invites: {
        Row: {
          accepted_at: string | null
          coach_id: string
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          coach_id: string
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          coach_id?: string
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_invites_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          dunning_count: number
          dunning_paused: boolean
          group_id: string | null
          id: string
          issued_on: string
          issuer_snapshot: Json
          kind: Database["public"]["Enums"]["invoice_kind"]
          last_dunned_at: string | null
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
          dunning_count?: number
          dunning_paused?: boolean
          group_id?: string | null
          id?: string
          issued_on?: string
          issuer_snapshot?: Json
          kind?: Database["public"]["Enums"]["invoice_kind"]
          last_dunned_at?: string | null
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
          dunning_count?: number
          dunning_paused?: boolean
          group_id?: string | null
          id?: string
          issued_on?: string
          issuer_snapshot?: Json
          kind?: Database["public"]["Enums"]["invoice_kind"]
          last_dunned_at?: string | null
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
      ledger_attachments: {
        Row: {
          created_at: string
          entry_id: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entry_id: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entry_id?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_attachments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_categories: {
        Row: {
          active: boolean
          annex_post: string | null
          code: string
          direction: Database["public"]["Enums"]["ledger_direction"]
          label: string
          position: number
        }
        Insert: {
          active?: boolean
          annex_post?: string | null
          code: string
          direction: Database["public"]["Enums"]["ledger_direction"]
          label: string
          position?: number
        }
        Update: {
          active?: boolean
          annex_post?: string | null
          code?: string
          direction?: Database["public"]["Enums"]["ledger_direction"]
          label?: string
          position?: number
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          account: Database["public"]["Enums"]["ledger_account"]
          amount_cents: number
          bank_ref: string | null
          category_code: string | null
          communication: string | null
          counterparty: string | null
          counterparty_iban: string | null
          created_at: string
          created_by: string | null
          description: string
          fiscal_year: number
          id: string
          invoice_id: string | null
          notes: string | null
          operation_date: string
          piece_number: string | null
          source: string
          statement_no: string | null
          statement_seq: string | null
          updated_at: string
          value_date: string | null
        }
        Insert: {
          account?: Database["public"]["Enums"]["ledger_account"]
          amount_cents: number
          bank_ref?: string | null
          category_code?: string | null
          communication?: string | null
          counterparty?: string | null
          counterparty_iban?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          fiscal_year: number
          id?: string
          invoice_id?: string | null
          notes?: string | null
          operation_date: string
          piece_number?: string | null
          source?: string
          statement_no?: string | null
          statement_seq?: string | null
          updated_at?: string
          value_date?: string | null
        }
        Update: {
          account?: Database["public"]["Enums"]["ledger_account"]
          amount_cents?: number
          bank_ref?: string | null
          category_code?: string | null
          communication?: string | null
          counterparty?: string | null
          counterparty_iban?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          fiscal_year?: number
          id?: string
          invoice_id?: string | null
          notes?: string | null
          operation_date?: string
          piece_number?: string | null
          source?: string
          statement_no?: string | null
          statement_seq?: string | null
          updated_at?: string
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_category_code_fkey"
            columns: ["category_code"]
            isOneToOne: false
            referencedRelation: "ledger_categories"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_piece_counters: {
        Row: {
          fiscal_year: number
          last_number: number
        }
        Insert: {
          fiscal_year: number
          last_number?: number
        }
        Update: {
          fiscal_year?: number
          last_number?: number
        }
        Relationships: []
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
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          note: string | null
          paid_on: string
          recorded_by: string | null
          reference: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          note?: string | null
          paid_on?: string
          recorded_by?: string | null
          reference?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          note?: string | null
          paid_on?: string
          recorded_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          terms_accepted_at: string | null
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
          terms_accepted_at?: string | null
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
          terms_accepted_at?: string | null
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
          extension_offer_sent_at: string | null
          first_session: number
          group_id: string | null
          id: string
          late_cancellation: boolean
          level_mismatch: boolean
          notes: string | null
          player_id: string
          promo_code: string | null
          prorata_sessions: number | null
          requested_at: string
          season_id: string
          session_count: number | null
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
          extension_offer_sent_at?: string | null
          first_session?: number
          group_id?: string | null
          id?: string
          late_cancellation?: boolean
          level_mismatch?: boolean
          notes?: string | null
          player_id: string
          promo_code?: string | null
          prorata_sessions?: number | null
          requested_at?: string
          season_id: string
          session_count?: number | null
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
          extension_offer_sent_at?: string | null
          first_session?: number
          group_id?: string | null
          id?: string
          late_cancellation?: boolean
          level_mismatch?: boolean
          notes?: string | null
          player_id?: string
          promo_code?: string | null
          prorata_sessions?: number | null
          requested_at?: string
          season_id?: string
          session_count?: number | null
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
      sessions: {
        Row: {
          created_at: string
          date: string
          group_id: string
          id: string
          seq: number
          start_time: string | null
        }
        Insert: {
          created_at?: string
          date: string
          group_id: string
          id?: string
          seq: number
          start_time?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          group_id?: string
          id?: string
          seq?: number
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
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
          min_capacity: number | null
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
          min_capacity?: number | null
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
          min_capacity?: number | null
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
      accept_coach_invite: { Args: { p_token: string }; Returns: undefined }
      can_read_accounts: { Args: never; Returns: boolean }
      coach_group_roster: {
        Args: { p_group_id: string }
        Returns: {
          email: string
          first_name: string
          last_name: string
          level_code: string
          payment_status: string
          phone: string
          registration_id: string
        }[]
      }
      coach_group_sessions: {
        Args: { p_group_id: string }
        Returns: {
          date: string
          marked_count: number
          present_count: number
          seq: number
          session_id: string
          start_time: string
        }[]
      }
      coach_groups: {
        Args: never
        Returns: {
          group_id: string
          group_label: string
          group_status: string
          location_name: string
          member_count: number
          product_name: string
          slot_id: string
          start_time: string
          weekday: number
        }[]
      }
      coach_invite_info: {
        Args: { p_token: string }
        Returns: {
          accepted: boolean
          coach_name: string
          email: string
          valid: boolean
        }[]
      }
      coach_mark_attendance: {
        Args: {
          p_present: boolean
          p_registration_id: string
          p_session_id: string
        }
        Returns: undefined
      }
      coach_session_attendance: {
        Args: { p_session_id: string }
        Returns: {
          first_name: string
          last_name: string
          present: boolean
          registration_id: string
        }[]
      }
      coach_upcoming_sessions: {
        Args: never
        Returns: {
          date: string
          group_label: string
          location_name: string
          product_name: string
          session_id: string
          start_time: string
        }[]
      }
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      current_coach_id: { Args: never; Returns: string }
      engagement_covers: {
        Args: {
          p_count: number
          p_first: number
          p_seq: number
          p_slot_count: number
        }
        Returns: boolean
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
      next_piece_number: { Args: { p_year: number }; Returns: string }
      slot_engagements: {
        Args: { p_slot_ids: string[] }
        Returns: {
          first_session: number
          session_count: number
          slot_id: string
        }[]
      }
    }
    Enums: {
      app_role: "client" | "coach" | "admin" | "comptable"
      group_status: "forming" | "confirmed"
      invitation_status: "none" | "pending" | "accepted"
      invoice_kind: "invoice" | "credit_note"
      invoice_status: "draft" | "sent" | "paid" | "cancelled"
      ledger_account: "banque" | "caisse" | "epargne"
      ledger_direction: "recette" | "depense"
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
      app_role: ["client", "coach", "admin", "comptable"],
      group_status: ["forming", "confirmed"],
      invitation_status: ["none", "pending", "accepted"],
      invoice_kind: ["invoice", "credit_note"],
      invoice_status: ["draft", "sent", "paid", "cancelled"],
      ledger_account: ["banque", "caisse", "epargne"],
      ledger_direction: ["recette", "depense"],
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
