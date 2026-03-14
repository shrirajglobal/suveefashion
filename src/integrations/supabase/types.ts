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
      blog_posts: {
        Row: {
          category: string | null
          content: string
          content_bn: string | null
          content_hi: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          excerpt_bn: string | null
          excerpt_hi: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          published_at: string | null
          slug: string
          social_caption: string | null
          social_caption_hi: string | null
          status: string | null
          title: string
          title_bn: string | null
          title_hi: string | null
        }
        Insert: {
          category?: string | null
          content: string
          content_bn?: string | null
          content_hi?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          excerpt_bn?: string | null
          excerpt_hi?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          slug: string
          social_caption?: string | null
          social_caption_hi?: string | null
          status?: string | null
          title: string
          title_bn?: string | null
          title_hi?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          content_bn?: string | null
          content_hi?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          excerpt_bn?: string | null
          excerpt_hi?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          social_caption?: string | null
          social_caption_hi?: string | null
          status?: string | null
          title?: string
          title_bn?: string | null
          title_hi?: string | null
        }
        Relationships: []
      }
      buyer_profiles: {
        Row: {
          business_name: string
          business_type: Database["public"]["Enums"]["business_type"]
          city: string
          contact_person: string
          created_at: string
          discount_percent: number | null
          email: string
          gst_number: string | null
          id: string
          phone: string
          referral_source: string | null
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
          discount_percent?: number | null
          email: string
          gst_number?: string | null
          id?: string
          phone: string
          referral_source?: string | null
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
          discount_percent?: number | null
          email?: string
          gst_number?: string | null
          id?: string
          phone?: string
          referral_source?: string | null
          state?: string
          status?: Database["public"]["Enums"]["buyer_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      chat_feedback: {
        Row: {
          created_at: string
          id: string
          message_content: string
          rating: string
          user_state: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_content: string
          rating: string
          user_state?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string
          rating?: string
          user_state?: string | null
        }
        Relationships: []
      }
      chat_insights: {
        Row: {
          business_type: string | null
          created_at: string
          id: string
          key_insight: string | null
          question_summary: string | null
          question_topic: string | null
          user_state: string | null
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          id?: string
          key_insight?: string | null
          question_summary?: string | null
          question_topic?: string | null
          user_state?: string | null
        }
        Update: {
          business_type?: string | null
          created_at?: string
          id?: string
          key_insight?: string | null
          question_summary?: string | null
          question_topic?: string | null
          user_state?: string | null
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
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
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_number: string
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          total_items: number
          tracking_info: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_number: string
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          total_items?: number
          tracking_info?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_number?: string
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          total_items?: number
          tracking_info?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_images: string[] | null
          available_colours: string[] | null
          available_sizes: string[] | null
          bundle_type: string | null
          category_id: string | null
          combo_description: string | null
          created_at: string
          description: string | null
          fabric: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_new_arrival: boolean
          name: string
          pcs_per_set: number
          sizes: string
          updated_at: string
          wsp: number | null
        }
        Insert: {
          additional_images?: string[] | null
          available_colours?: string[] | null
          available_sizes?: string[] | null
          bundle_type?: string | null
          category_id?: string | null
          combo_description?: string | null
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_new_arrival?: boolean
          name: string
          pcs_per_set?: number
          sizes?: string
          updated_at?: string
          wsp?: number | null
        }
        Update: {
          additional_images?: string[] | null
          available_colours?: string[] | null
          available_sizes?: string[] | null
          bundle_type?: string | null
          category_id?: string | null
          combo_description?: string | null
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_new_arrival?: boolean
          name?: string
          pcs_per_set?: number
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
      sample_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          status: Database["public"]["Enums"]["sample_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          status?: Database["public"]["Enums"]["sample_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          status?: Database["public"]["Enums"]["sample_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      app_role: "admin" | "buyer" | "sub_admin"
      business_type: "retailer" | "wholesaler"
      buyer_status: "pending" | "approved" | "rejected"
      order_status:
        | "placed"
        | "confirmed"
        | "dispatched"
        | "delivered"
        | "cancelled"
      sample_status:
        | "requested"
        | "approved"
        | "dispatched"
        | "delivered"
        | "rejected"
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
      app_role: ["admin", "buyer", "sub_admin"],
      business_type: ["retailer", "wholesaler"],
      buyer_status: ["pending", "approved", "rejected"],
      order_status: [
        "placed",
        "confirmed",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      sample_status: [
        "requested",
        "approved",
        "dispatched",
        "delivered",
        "rejected",
      ],
    },
  },
} as const
