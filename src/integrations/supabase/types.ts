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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      buyer_profiles: {
        Row: {
          business_name: string
          business_type: Database["public"]["Enums"]["business_type"]
          city: string
          contact_person: string
          created_at: string
          email: string
          gst_number: string | null
          id: string
          phone: string
          state: string
          status: Database["public"]["Enums"]["buyer_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          business_type?: Database["public"]["Enums"]["business_type"]
          city: string
          contact_person: string
          created_at?: string
          email: string
          gst_number?: string | null
          id?: string
          phone: string
          state?: string
          status?: Database["public"]["Enums"]["buyer_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          business_type?: Database["public"]["Enums"]["business_type"]
          city?: string
          contact_person?: string
          created_at?: string
          email?: string
          gst_number?: string | null
          id?: string
          phone?: string
          state?: string
          status?: Database["public"]["Enums"]["buyer_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          name: string
          name_bn: string | null
          name_hi: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          name_bn?: string | null
          name_hi?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          name_bn?: string | null
          name_hi?: string | null
          slug?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          business_name: string
          contact_person: string
          created_at: string
          email: string | null
          expected_quantity: string | null
          id: string
          message: string | null
          phone: string
          products_interested: string | null
          status: string
        }
        Insert: {
          business_name: string
          contact_person: string
          created_at?: string
          email?: string | null
          expected_quantity?: string | null
          id?: string
          message?: string | null
          phone: string
          products_interested?: string | null
          status?: string
        }
        Update: {
          business_name?: string
          contact_person?: string
          created_at?: string
          email?: string | null
          expected_quantity?: string | null
          id?: string
          message?: string | null
          phone?: string
          products_interested?: string | null
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          bulk_price_100: number | null
          bulk_price_50: number | null
          bulk_price_500: number | null
          category_id: string | null
          created_at: string
          description: string | null
          fabric: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_new_arrival: boolean
          moq: number
          name: string
          sizes: string
          updated_at: string
          wsp: number | null
        }
        Insert: {
          bulk_price_100?: number | null
          bulk_price_50?: number | null
          bulk_price_500?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_new_arrival?: boolean
          moq?: number
          name: string
          sizes?: string
          updated_at?: string
          wsp?: number | null
        }
        Update: {
          bulk_price_100?: number | null
          bulk_price_50?: number | null
          bulk_price_500?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_new_arrival?: boolean
          moq?: number
          name?: string
          sizes?: string
          updated_at?: string
          wsp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_buyer_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["buyer_status"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "buyer"
      business_type: "retailer" | "wholesaler"
      buyer_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "buyer"],
      business_type: ["retailer", "wholesaler"],
      buyer_status: ["pending", "approved", "rejected"],
    },
  },
} as const
