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
      friends: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          player_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          player_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          player_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          coins_earned: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          obstacles_passed: number | null
          pet_used: string | null
          player_id: string | null
          score: number
          xp_earned: number | null
        }
        Insert: {
          coins_earned?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          obstacles_passed?: number | null
          pet_used?: string | null
          player_id?: string | null
          score: number
          xp_earned?: number | null
        }
        Update: {
          coins_earned?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          obstacles_passed?: number | null
          pet_used?: string | null
          player_id?: string | null
          score?: number
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_pet_used_fkey"
            columns: ["pet_used"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          created_at: string | null
          id: string
          period: string | null
          player_id: string | null
          rank: number | null
          score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period?: string | null
          player_id?: string | null
          rank?: number | null
          score: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string | null
          player_id?: string | null
          rank?: number | null
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          base_stats: Json | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          rarity: string
          type: string
        }
        Insert: {
          base_stats?: Json | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity: string
          type: string
        }
        Update: {
          base_stats?: Json | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string
          type?: string
        }
        Relationships: []
      }
      player_pets: {
        Row: {
          acquired_at: string | null
          id: string
          is_active: boolean | null
          level: number | null
          pet_id: string | null
          player_id: string | null
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          pet_id?: string | null
          player_id?: string | null
        }
        Update: {
          acquired_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          pet_id?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_pets_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          coins: number | null
          created_at: string | null
          energy: number | null
          high_score: number | null
          id: string
          level: number | null
          max_energy: number | null
          total_games_played: number | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          coins?: number | null
          created_at?: string | null
          energy?: number | null
          high_score?: number | null
          id: string
          level?: number | null
          max_energy?: number | null
          total_games_played?: number | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          coins?: number | null
          created_at?: string | null
          energy?: number | null
          high_score?: number | null
          id?: string
          level?: number | null
          max_energy?: number | null
          total_games_played?: number | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          from_player_id: string | null
          id: string
          item_id: string | null
          item_type: string | null
          player_id: string | null
          quantity: number | null
          to_player_id: string | null
          transaction_type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          from_player_id?: string | null
          id?: string
          item_id?: string | null
          item_type?: string | null
          player_id?: string | null
          quantity?: number | null
          to_player_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          from_player_id?: string | null
          id?: string
          item_id?: string | null
          item_type?: string | null
          player_id?: string | null
          quantity?: number | null
          to_player_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_player_id_fkey"
            columns: ["from_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_player_id_fkey"
            columns: ["to_player_id"]
            isOneToOne: false
            referencedRelation: "players"
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
    Enums: {},
  },
} as const
