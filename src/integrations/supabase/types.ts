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
      avatars: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_available: boolean
          level_required: number
          name: string
          price: number
          rarity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_available?: boolean
          level_required?: number
          name: string
          price?: number
          rarity?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_available?: boolean
          level_required?: number
          name?: string
          price?: number
          rarity?: string
          updated_at?: string
        }
        Relationships: []
      }
      duel_invites: {
        Row: {
          challenged_id: string
          challenger_id: string
          created_at: string
          expires_at: string
          id: string
          quiz_topic: string
          status: string
        }
        Insert: {
          challenged_id: string
          challenger_id: string
          created_at?: string
          expires_at?: string
          id?: string
          quiz_topic: string
          status?: string
        }
        Update: {
          challenged_id?: string
          challenger_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          quiz_topic?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "duel_invites_challenged_id_fkey"
            columns: ["challenged_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_invites_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      duels: {
        Row: {
          created_at: string
          current_question: number | null
          current_turn: string | null
          finished_at: string | null
          id: string
          invite_id: string
          player1_answers: Json | null
          player1_id: string
          player1_score: number | null
          player2_answers: Json | null
          player2_id: string
          player2_score: number | null
          questions: Json
          quiz_topic: string
          status: string
          turn_started_at: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_question?: number | null
          current_turn?: string | null
          finished_at?: string | null
          id?: string
          invite_id: string
          player1_answers?: Json | null
          player1_id: string
          player1_score?: number | null
          player2_answers?: Json | null
          player2_id: string
          player2_score?: number | null
          questions: Json
          quiz_topic: string
          status?: string
          turn_started_at?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_question?: number | null
          current_turn?: string | null
          finished_at?: string | null
          id?: string
          invite_id?: string
          player1_answers?: Json | null
          player1_id?: string
          player1_score?: number | null
          player2_answers?: Json | null
          player2_id?: string
          player2_score?: number | null
          questions?: Json
          quiz_topic?: string
          status?: string
          turn_started_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duels_current_turn_fkey"
            columns: ["current_turn"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "duel_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duels_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_hours: number | null
          effects: Json | null
          id: string
          image_url: string | null
          is_available: boolean
          level_required: number
          name: string
          price: number
          rarity: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          effects?: Json | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          level_required?: number
          name: string
          price?: number
          rarity?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          effects?: Json | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          level_required?: number
          name?: string
          price?: number
          rarity?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_id: string | null
          completed_lessons: number | null
          created_at: string
          id: string
          level: number | null
          nickname: string
          points: number
          streak: number | null
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          avatar_id?: string | null
          completed_lessons?: number | null
          created_at?: string
          id?: string
          level?: number | null
          nickname: string
          points?: number
          streak?: number | null
          updated_at?: string
          user_id: string
          xp?: number | null
        }
        Update: {
          avatar_id?: string | null
          completed_lessons?: number | null
          created_at?: string
          id?: string
          level?: number | null
          nickname?: string
          points?: number
          streak?: number | null
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatars: {
        Row: {
          avatar_id: string
          id: string
          is_active: boolean
          purchased_at: string
          user_id: string
        }
        Insert: {
          avatar_id: string
          id?: string
          is_active?: boolean
          purchased_at?: string
          user_id: string
        }
        Update: {
          avatar_id?: string
          id?: string
          is_active?: boolean
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_avatars_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_avatars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_products: {
        Row: {
          expires_at: string | null
          id: string
          is_active: boolean
          product_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_active?: boolean
          product_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_active?: boolean
          product_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_products_user_id_fkey"
            columns: ["user_id"]
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
