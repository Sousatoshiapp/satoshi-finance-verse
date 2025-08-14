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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string | null
          created_at: string
          description: string
          id: string
          name: string
          rarity: string
          requirement_data: Json
          reward_data: Json | null
          type: string
        }
        Insert: {
          badge_icon?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          rarity?: string
          requirement_data: Json
          reward_data?: Json | null
          type: string
        }
        Update: {
          badge_icon?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          rarity?: string
          requirement_data?: Json
          reward_data?: Json | null
          type?: string
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_feed_target_user"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activity_feed_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_password_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_tokens: {
        Row: {
          admin_email: string
          created_at: string | null
          expires_at: string
          id: string
          metadata: Json | null
          token: string
          token_type: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          admin_email: string
          created_at?: string | null
          expires_at: string
          id?: string
          metadata?: Json | null
          token: string
          token_type?: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          admin_email?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          token?: string
          token_type?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advanced_powerups: {
        Row: {
          category: Database["public"]["Enums"]["powerup_category"]
          cooldown_minutes: number | null
          crafting_recipe: Json | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          effects: Json
          id: string
          image_url: string | null
          is_active: boolean | null
          max_uses_per_day: number | null
          name: string
          rarity: Database["public"]["Enums"]["powerup_rarity"]
          unlock_requirements: Json | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["powerup_category"]
          cooldown_minutes?: number | null
          crafting_recipe?: Json | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          effects?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_uses_per_day?: number | null
          name: string
          rarity?: Database["public"]["Enums"]["powerup_rarity"]
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["powerup_category"]
          cooldown_minutes?: number | null
          crafting_recipe?: Json | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          effects?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_uses_per_day?: number | null
          name?: string
          rarity?: Database["public"]["Enums"]["powerup_rarity"]
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string | null
          commission_amount_cents: number
          created_at: string
          id: string
          paid_at: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          commission_amount_cents: number
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          commission_amount_cents?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_programs: {
        Row: {
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          referral_code: string
          total_commission_earned: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          referral_code: string
          total_commission_earned?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          referral_code?: string
          total_commission_earned?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          applied: boolean | null
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          recommendation_data: Json
          recommendation_type: string
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recommendation_data: Json
          recommendation_type: string
          user_id: string
        }
        Update: {
          applied?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recommendation_data?: Json
          recommendation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_tournaments: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          entry_cost: number | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          name: string
          prize_pool: Json | null
          questions_per_match: number | null
          start_time: string
          tournament_type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          entry_cost?: number | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name: string
          prize_pool?: Json | null
          questions_per_match?: number | null
          start_time: string
          tournament_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          entry_cost?: number | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name?: string
          prize_pool?: Json | null
          questions_per_match?: number | null
          start_time?: string
          tournament_type?: string | null
        }
        Relationships: []
      }
      avatar_customizations: {
        Row: {
          avatar_data: Json
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          avatar_data?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          avatar_data?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_avatar_customizations_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_evolutions: {
        Row: {
          bonus_changes: Json | null
          created_at: string
          evolution_level: number
          id: string
          unlocked_at: string | null
          user_avatar_id: string
          visual_changes: Json | null
          xp_required: number
        }
        Insert: {
          bonus_changes?: Json | null
          created_at?: string
          evolution_level?: number
          id?: string
          unlocked_at?: string | null
          user_avatar_id: string
          visual_changes?: Json | null
          xp_required?: number
        }
        Update: {
          bonus_changes?: Json | null
          created_at?: string
          evolution_level?: number
          id?: string
          unlocked_at?: string | null
          user_avatar_id?: string
          visual_changes?: Json | null
          xp_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "avatar_evolutions_user_avatar_id_fkey"
            columns: ["user_avatar_id"]
            isOneToOne: false
            referencedRelation: "user_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_frames: {
        Row: {
          animation_type: string
          created_at: string
          css_class: string
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          rarity: string
          unlock_requirement: Json
        }
        Insert: {
          animation_type: string
          created_at?: string
          css_class: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          rarity?: string
          unlock_requirement?: Json
        }
        Update: {
          animation_type?: string
          created_at?: string
          css_class?: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          rarity?: string
          unlock_requirement?: Json
        }
        Relationships: []
      }
      avatar_items: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          price_beetz: number | null
          rarity: string
          subcategory: string | null
          unlock_requirement: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          price_beetz?: number | null
          rarity?: string
          subcategory?: string | null
          unlock_requirement?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          price_beetz?: number | null
          rarity?: string
          subcategory?: string | null
          unlock_requirement?: Json
          updated_at?: string
        }
        Relationships: []
      }
      avatar_pets: {
        Row: {
          created_at: string
          evolution_name: string
          evolution_stage: number
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          rarity: string
          special_abilities: Json | null
          species: string
          unlock_streak_required: number
        }
        Insert: {
          created_at?: string
          evolution_name: string
          evolution_stage?: number
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          rarity?: string
          special_abilities?: Json | null
          species: string
          unlock_streak_required?: number
        }
        Update: {
          created_at?: string
          evolution_name?: string
          evolution_stage?: number
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          rarity?: string
          special_abilities?: Json | null
          species?: string
          unlock_streak_required?: number
        }
        Relationships: []
      }
      avatars: {
        Row: {
          avatar_class: string | null
          backstory: string | null
          bonus_effects: Json | null
          created_at: string
          description: string | null
          district_theme: string | null
          evolution_level: number | null
          exclusive_district_id: string | null
          id: string
          image_url: string
          is_available: boolean
          is_district_exclusive: boolean | null
          is_starter: boolean | null
          level_required: number
          model_url: string | null
          name: string
          price: number
          rarity: string
          unlock_requirements: Json | null
          updated_at: string
        }
        Insert: {
          avatar_class?: string | null
          backstory?: string | null
          bonus_effects?: Json | null
          created_at?: string
          description?: string | null
          district_theme?: string | null
          evolution_level?: number | null
          exclusive_district_id?: string | null
          id?: string
          image_url: string
          is_available?: boolean
          is_district_exclusive?: boolean | null
          is_starter?: boolean | null
          level_required?: number
          model_url?: string | null
          name: string
          price?: number
          rarity?: string
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_class?: string | null
          backstory?: string | null
          bonus_effects?: Json | null
          created_at?: string
          description?: string | null
          district_theme?: string | null
          evolution_level?: number | null
          exclusive_district_id?: string | null
          id?: string
          image_url?: string
          is_available?: boolean
          is_district_exclusive?: boolean | null
          is_starter?: boolean | null
          level_required?: number
          model_url?: string | null
          name?: string
          price?: number
          rarity?: string
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatars_exclusive_district_id_fkey"
            columns: ["exclusive_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          bot_id: string
          created_at: string
          id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          bot_id: string
          created_at?: string
          id?: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          bot_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_activity_log_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_duel_configs: {
        Row: {
          accuracy_percentage: number | null
          bot_profile_id: string
          created_at: string
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          response_time_max: number | null
          response_time_min: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          bot_profile_id: string
          created_at?: string
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          response_time_max?: number | null
          response_time_min?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          bot_profile_id?: string
          created_at?: string
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          response_time_max?: number | null
          response_time_min?: number | null
        }
        Relationships: []
      }
      bot_presence_simulation: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          is_online: boolean
          last_activity_at: string
          online_probability: number
          peak_hours: number[]
          personality_type: string
          updated_at: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          is_online?: boolean
          last_activity_at?: string
          online_probability?: number
          peak_hours?: number[]
          personality_type?: string
          updated_at?: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          is_online?: boolean
          last_activity_at?: string
          online_probability?: number
          peak_hours?: number[]
          personality_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_presence_simulation_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      btc_bots: {
        Row: {
          created_at: string | null
          difficulty_level: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          max_bet_amount: number | null
          min_bet_amount: number | null
          profile_id: string
          win_rate: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          max_bet_amount?: number | null
          min_bet_amount?: number | null
          profile_id: string
          win_rate?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          max_bet_amount?: number | null
          min_bet_amount?: number | null
          profile_id?: string
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "btc_bots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      btc_duel_queue: {
        Row: {
          bet_amount: number
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          bet_amount: number
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bet_amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      btc_prediction_duels: {
        Row: {
          bet_amount: number
          completed_at: string | null
          created_at: string
          expires_at: string
          final_btc_price: number | null
          id: string
          initial_btc_price: number
          player1_id: string
          player1_prediction: string
          player2_id: string
          player2_prediction: string
          prediction_duration: number
          price_source: string
          started_at: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          bet_amount: number
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          final_btc_price?: number | null
          id?: string
          initial_btc_price: number
          player1_id: string
          player1_prediction: string
          player2_id: string
          player2_prediction: string
          prediction_duration?: number
          price_source?: string
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          final_btc_price?: number | null
          id?: string
          initial_btc_price?: number
          player1_id?: string
          player1_prediction?: string
          player2_id?: string
          player2_prediction?: string
          prediction_duration?: number
          price_source?: string
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      btz_penalty_history: {
        Row: {
          btz_after: number
          btz_before: number
          created_at: string | null
          days_inactive: number
          id: string
          penalty_amount: number
          penalty_rate: number
          user_id: string
        }
        Insert: {
          btz_after: number
          btz_before: number
          created_at?: string | null
          days_inactive: number
          id?: string
          penalty_amount: number
          penalty_rate: number
          user_id: string
        }
        Update: {
          btz_after?: number
          btz_before?: number
          created_at?: string | null
          days_inactive?: number
          id?: string
          penalty_amount?: number
          penalty_rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "btz_penalty_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      btz_yield_history: {
        Row: {
          btz_after: number
          btz_before: number
          created_at: string | null
          id: string
          streak_bonus: number | null
          subscription_bonus: number | null
          user_id: string
          yield_amount: number
          yield_rate: number
        }
        Insert: {
          btz_after: number
          btz_before: number
          created_at?: string | null
          id?: string
          streak_bonus?: number | null
          subscription_bonus?: number | null
          user_id: string
          yield_amount: number
          yield_rate: number
        }
        Update: {
          btz_after?: number
          btz_before?: number
          created_at?: string | null
          id?: string
          streak_bonus?: number | null
          subscription_bonus?: number | null
          user_id?: string
          yield_amount?: number
          yield_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "btz_yield_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_duel_answers: {
        Row: {
          created_at: string
          duel_id: string
          id: string
          is_correct: boolean
          question_index: number
          response_time_ms: number
          selected_answer: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duel_id: string
          id?: string
          is_correct?: boolean
          question_index: number
          response_time_ms: number
          selected_answer: string
          user_id: string
        }
        Update: {
          created_at?: string
          duel_id?: string
          id?: string
          is_correct?: boolean
          question_index?: number
          response_time_ms?: number
          selected_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_duel_answers_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "casino_duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casino_duel_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_duel_queue: {
        Row: {
          bet_amount: number
          created_at: string
          expires_at: string
          id: string
          topic: string
          user_id: string
        }
        Insert: {
          bet_amount: number
          created_at?: string
          expires_at?: string
          id?: string
          topic: string
          user_id: string
        }
        Update: {
          bet_amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_duel_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_duels: {
        Row: {
          bet_amount: number
          completed_at: string | null
          created_at: string
          current_question: number
          id: string
          player1_id: string
          player1_score: number
          player2_id: string
          player2_score: number
          questions: Json
          started_at: string | null
          status: string
          topic: string
          winner_id: string | null
        }
        Insert: {
          bet_amount: number
          completed_at?: string | null
          created_at?: string
          current_question?: number
          id?: string
          player1_id: string
          player1_score?: number
          player2_id: string
          player2_score?: number
          questions?: Json
          started_at?: string | null
          status?: string
          topic: string
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          completed_at?: string | null
          created_at?: string
          current_question?: number
          id?: string
          player1_id?: string
          player1_score?: number
          player2_id?: string
          player2_score?: number
          questions?: Json
          started_at?: string | null
          status?: string
          topic?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casino_duels_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casino_duels_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casino_duels_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      city_emergency_contributions: {
        Row: {
          btz_contributed: number | null
          contribution_type: string | null
          created_at: string | null
          emergency_id: string
          heroic_action: string | null
          id: string
          user_id: string
          xp_contributed: number | null
        }
        Insert: {
          btz_contributed?: number | null
          contribution_type?: string | null
          created_at?: string | null
          emergency_id: string
          heroic_action?: string | null
          id?: string
          user_id: string
          xp_contributed?: number | null
        }
        Update: {
          btz_contributed?: number | null
          contribution_type?: string | null
          created_at?: string | null
          emergency_id?: string
          heroic_action?: string | null
          id?: string
          user_id?: string
          xp_contributed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "city_emergency_contributions_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "city_emergency_events"
            referencedColumns: ["id"]
          },
        ]
      }
      city_emergency_events: {
        Row: {
          btz_goal: number
          created_at: string | null
          crisis_type: string
          current_btz_contributions: number | null
          current_xp_contributions: number | null
          description: string
          duration_hours: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          penalty_multiplier: number | null
          reward_multiplier: number | null
          start_time: string | null
          theme_data: Json | null
          title: string
          updated_at: string | null
          xp_goal: number
        }
        Insert: {
          btz_goal?: number
          created_at?: string | null
          crisis_type?: string
          current_btz_contributions?: number | null
          current_xp_contributions?: number | null
          description: string
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          penalty_multiplier?: number | null
          reward_multiplier?: number | null
          start_time?: string | null
          theme_data?: Json | null
          title: string
          updated_at?: string | null
          xp_goal?: number
        }
        Update: {
          btz_goal?: number
          created_at?: string | null
          crisis_type?: string
          current_btz_contributions?: number | null
          current_xp_contributions?: number | null
          description?: string
          duration_hours?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          penalty_multiplier?: number | null
          reward_multiplier?: number | null
          start_time?: string | null
          theme_data?: Json | null
          title?: string
          updated_at?: string | null
          xp_goal?: number
        }
        Relationships: []
      }
      collectible_items: {
        Row: {
          attributes: Json | null
          category: string
          created_at: string
          current_supply: number | null
          description: string | null
          id: string
          image_url: string | null
          is_mintable: boolean | null
          mint_price_beetz: number | null
          name: string
          rarity: string
          total_supply: number | null
        }
        Insert: {
          attributes?: Json | null
          category: string
          created_at?: string
          current_supply?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_mintable?: boolean | null
          mint_price_beetz?: number | null
          name: string
          rarity?: string
          total_supply?: number | null
        }
        Update: {
          attributes?: Json | null
          category?: string
          created_at?: string
          current_supply?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_mintable?: boolean | null
          mint_price_beetz?: number | null
          name?: string
          rarity?: string
          total_supply?: number | null
        }
        Relationships: []
      }
      combo_achievements: {
        Row: {
          badge_icon: string | null
          beetz_reward: number | null
          combo_type: Database["public"]["Enums"]["combo_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          powerup_reward: string | null
          rarity: Database["public"]["Enums"]["powerup_rarity"] | null
          target_value: number
          xp_reward: number | null
        }
        Insert: {
          badge_icon?: string | null
          beetz_reward?: number | null
          combo_type: Database["public"]["Enums"]["combo_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          powerup_reward?: string | null
          rarity?: Database["public"]["Enums"]["powerup_rarity"] | null
          target_value: number
          xp_reward?: number | null
        }
        Update: {
          badge_icon?: string | null
          beetz_reward?: number | null
          combo_type?: Database["public"]["Enums"]["combo_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          powerup_reward?: string | null
          rarity?: Database["public"]["Enums"]["powerup_rarity"] | null
          target_value?: number
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "combo_achievements_powerup_reward_fkey"
            columns: ["powerup_reward"]
            isOneToOne: false
            referencedRelation: "advanced_powerups"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_connection_questions: {
        Row: {
          correct_connections: Json
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          is_active: boolean
          left_concepts: Json
          right_concepts: Json
          theme: string
          updated_at: string
        }
        Insert: {
          correct_connections: Json
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          is_active?: boolean
          left_concepts: Json
          right_concepts: Json
          theme: string
          updated_at?: string
        }
        Update: {
          correct_connections?: Json
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          is_active?: boolean
          left_concepts?: Json
          right_concepts?: Json
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      concept_connection_sessions: {
        Row: {
          btz_earned: number
          completed_at: string
          connections_made: Json
          correct_connections: number
          created_at: string
          id: string
          question_id: string
          time_seconds: number
          total_connections: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          btz_earned?: number
          completed_at?: string
          connections_made?: Json
          correct_connections?: number
          created_at?: string
          id?: string
          question_id: string
          time_seconds?: number
          total_connections?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          btz_earned?: number
          completed_at?: string
          connections_made?: Json
          correct_connections?: number
          created_at?: string
          id?: string
          question_id?: string
          time_seconds?: number
          total_connections?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "concept_connection_sessions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "concept_connection_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant1_id: string
          participant2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant1_id: string
          participant2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant1_id?: string
          participant2_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_participant1"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_participant2"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_contributions: {
        Row: {
          btz_contributed: number
          contribution_type: string
          created_at: string
          crisis_id: string
          district_id: string | null
          heroic_action: string | null
          id: string
          user_id: string
          xp_contributed: number
        }
        Insert: {
          btz_contributed?: number
          contribution_type?: string
          created_at?: string
          crisis_id: string
          district_id?: string | null
          heroic_action?: string | null
          id?: string
          user_id: string
          xp_contributed?: number
        }
        Update: {
          btz_contributed?: number
          contribution_type?: string
          created_at?: string
          crisis_id?: string
          district_id?: string | null
          heroic_action?: string | null
          id?: string
          user_id?: string
          xp_contributed?: number
        }
        Relationships: [
          {
            foreignKeyName: "crisis_contributions_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crisis_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_contributions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_district_goals: {
        Row: {
          btz_goal: number
          completed_at: string | null
          created_at: string
          crisis_id: string
          current_btz: number
          current_xp: number
          district_id: string
          id: string
          is_completed: boolean
          updated_at: string
          xp_goal: number
        }
        Insert: {
          btz_goal?: number
          completed_at?: string | null
          created_at?: string
          crisis_id: string
          current_btz?: number
          current_xp?: number
          district_id: string
          id?: string
          is_completed?: boolean
          updated_at?: string
          xp_goal?: number
        }
        Update: {
          btz_goal?: number
          completed_at?: string | null
          created_at?: string
          crisis_id?: string
          current_btz?: number
          current_xp?: number
          district_id?: string
          id?: string
          is_completed?: boolean
          updated_at?: string
          xp_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "crisis_district_goals_crisis_id_fkey"
            columns: ["crisis_id"]
            isOneToOne: false
            referencedRelation: "crisis_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_district_goals_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_events: {
        Row: {
          created_at: string
          crisis_type: string
          current_btz_contributions: number
          current_xp_contributions: number
          description: string
          end_time: string
          id: string
          is_active: boolean
          narrative_data: Json | null
          reward_data: Json | null
          start_time: string
          status: string
          title: string
          total_btz_goal: number
          total_xp_goal: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          crisis_type?: string
          current_btz_contributions?: number
          current_xp_contributions?: number
          description: string
          end_time?: string
          id?: string
          is_active?: boolean
          narrative_data?: Json | null
          reward_data?: Json | null
          start_time?: string
          status?: string
          title: string
          total_btz_goal?: number
          total_xp_goal?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          crisis_type?: string
          current_btz_contributions?: number
          current_xp_contributions?: number
          description?: string
          end_time?: string
          id?: string
          is_active?: boolean
          narrative_data?: Json | null
          reward_data?: Json | null
          start_time?: string
          status?: string
          title?: string
          total_btz_goal?: number
          total_xp_goal?: number
          updated_at?: string
        }
        Relationships: []
      }
      crypto_payments: {
        Row: {
          amount_usd: number
          confirmed_at: string | null
          created_at: string
          crypto_amount: number | null
          crypto_currency: string | null
          expires_at: string | null
          id: string
          payment_id: string
          payment_url: string | null
          product_id: string
          product_name: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          confirmed_at?: string | null
          created_at?: string
          crypto_amount?: number | null
          crypto_currency?: string | null
          expires_at?: string | null
          id?: string
          payment_id: string
          payment_url?: string | null
          product_id: string
          product_name: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          confirmed_at?: string | null
          created_at?: string
          crypto_amount?: number | null
          crypto_currency?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string
          payment_url?: string | null
          product_id?: string
          product_name?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          beetz_reward: number
          challenge_type: string
          created_at: string
          description: string
          difficulty: string
          expires_at: string
          id: string
          is_active: boolean
          target_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          beetz_reward?: number
          challenge_type: string
          created_at?: string
          description: string
          difficulty?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          target_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          beetz_reward?: number
          challenge_type?: string
          created_at?: string
          description?: string
          difficulty?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          target_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_lessons: {
        Row: {
          btz_reward: number
          category: string
          content: string
          correct_answer: number
          created_at: string
          id: string
          is_active: boolean
          is_main_lesson: boolean
          lesson_date: string
          quiz_options: Json
          quiz_question: string
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          btz_reward?: number
          category: string
          content: string
          correct_answer: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_main_lesson?: boolean
          lesson_date?: string
          quiz_options?: Json
          quiz_question: string
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          btz_reward?: number
          category?: string
          content?: string
          correct_answer?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_main_lesson?: boolean
          lesson_date?: string
          quiz_options?: Json
          quiz_question?: string
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          beetz_reward: number
          category: string
          created_at: string
          description: string
          difficulty: string
          expires_at: string
          id: string
          is_active: boolean
          is_weekend_special: boolean
          mission_type: string
          target_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          beetz_reward?: number
          category: string
          created_at?: string
          description: string
          difficulty?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          is_weekend_special?: boolean
          mission_type: string
          target_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          beetz_reward?: number
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          is_weekend_special?: boolean
          mission_type?: string
          target_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          media_url: string | null
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_url?: string | null
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_url?: string | null
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      district_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          completed_at: string
          created_at: string
          district_id: string
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          completed_at?: string
          created_at?: string
          district_id: string
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          completed_at?: string
          created_at?: string
          district_id?: string
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_activities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_analytics: {
        Row: {
          created_at: string | null
          district_id: string
          id: string
          metric_data: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          created_at?: string | null
          district_id: string
          id?: string
          metric_data?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string
          id?: string
          metric_data?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_analytics_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_battles: {
        Row: {
          attacking_district_id: string
          battle_data: Json | null
          battle_type: string | null
          completed_at: string | null
          created_at: string | null
          defending_district_id: string
          id: string
          rewards: Json | null
          started_at: string | null
          status: string | null
          winner_district_id: string | null
        }
        Insert: {
          attacking_district_id: string
          battle_data?: Json | null
          battle_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          defending_district_id: string
          id?: string
          rewards?: Json | null
          started_at?: string | null
          status?: string | null
          winner_district_id?: string | null
        }
        Update: {
          attacking_district_id?: string
          battle_data?: Json | null
          battle_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          defending_district_id?: string
          id?: string
          rewards?: Json | null
          started_at?: string | null
          status?: string | null
          winner_district_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_battles_attacking_district_id_fkey"
            columns: ["attacking_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_battles_defending_district_id_fkey"
            columns: ["defending_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_battles_winner_district_id_fkey"
            columns: ["winner_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          district_id: string
          id: string
          is_deleted: boolean | null
          message_type: string | null
          reply_to_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          district_id: string
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          district_id?: string
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_chat_messages_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "district_chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      district_daily_quests: {
        Row: {
          created_at: string
          district_id: string
          id: string
          is_active: boolean
          points_reward: number
          quest_description: string
          quest_name: string
          quest_type: string
          reset_frequency: string
          target_value: number
          xp_reward: number
        }
        Insert: {
          created_at?: string
          district_id: string
          id?: string
          is_active?: boolean
          points_reward?: number
          quest_description: string
          quest_name: string
          quest_type: string
          reset_frequency?: string
          target_value: number
          xp_reward?: number
        }
        Update: {
          created_at?: string
          district_id?: string
          id?: string
          is_active?: boolean
          points_reward?: number
          quest_description?: string
          quest_name?: string
          quest_type?: string
          reset_frequency?: string
          target_value?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "district_daily_quests_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_duel_participants: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          district_id: string
          duel_id: string
          id: string
          participation_time_seconds: number | null
          score: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          district_id: string
          duel_id: string
          id?: string
          participation_time_seconds?: number | null
          score?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          district_id?: string
          duel_id?: string
          id?: string
          participation_time_seconds?: number | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_duel_participants_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_duel_participants_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "district_duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_duel_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      district_duels: {
        Row: {
          average_score_challenged: number | null
          average_score_initiator: number | null
          challenged_district_id: string
          created_at: string | null
          end_time: string | null
          id: string
          initiator_district_id: string
          participants_count_challenged: number | null
          participants_count_initiator: number | null
          questions: Json | null
          start_time: string | null
          status: string | null
          total_questions: number | null
          updated_at: string | null
          winner_district_id: string | null
        }
        Insert: {
          average_score_challenged?: number | null
          average_score_initiator?: number | null
          challenged_district_id: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          initiator_district_id: string
          participants_count_challenged?: number | null
          participants_count_initiator?: number | null
          questions?: Json | null
          start_time?: string | null
          status?: string | null
          total_questions?: number | null
          updated_at?: string | null
          winner_district_id?: string | null
        }
        Update: {
          average_score_challenged?: number | null
          average_score_initiator?: number | null
          challenged_district_id?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          initiator_district_id?: string
          participants_count_challenged?: number | null
          participants_count_initiator?: number | null
          questions?: Json | null
          start_time?: string | null
          status?: string | null
          total_questions?: number | null
          updated_at?: string | null
          winner_district_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_duels_challenged_district_id_fkey"
            columns: ["challenged_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_duels_initiator_district_id_fkey"
            columns: ["initiator_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_duels_winner_district_id_fkey"
            columns: ["winner_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          district_id: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          district_id: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          district_id?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_notifications_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      district_quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty_level: number | null
          district_id: string
          explanation: string | null
          id: string
          is_active: boolean | null
          options: Json
          question: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty_level?: number | null
          district_id: string
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          question: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty_level?: number | null
          district_id?: string
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_quiz_questions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_store_items: {
        Row: {
          created_at: string | null
          description: string | null
          district_id: string
          effects: Json | null
          id: string
          image_url: string | null
          is_available: boolean | null
          item_type: string
          name: string
          price_beetz: number | null
          price_real_money: number | null
          rarity: string | null
          sponsor_branded: boolean | null
          unlock_requirements: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          district_id: string
          effects?: Json | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          item_type: string
          name: string
          price_beetz?: number | null
          price_real_money?: number | null
          rarity?: string | null
          sponsor_branded?: boolean | null
          unlock_requirements?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          district_id?: string
          effects?: Json | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          item_type?: string
          name?: string
          price_beetz?: number | null
          price_real_money?: number | null
          rarity?: string | null
          sponsor_branded?: boolean | null
          unlock_requirements?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_store_items_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_teams: {
        Row: {
          achievements: Json | null
          captain_id: string | null
          created_at: string | null
          description: string | null
          district_id: string
          id: string
          max_members: number | null
          members_count: number | null
          name: string
          sponsor_themed: boolean | null
          team_color: string | null
          team_motto: string | null
          team_power: number | null
          updated_at: string | null
        }
        Insert: {
          achievements?: Json | null
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          district_id: string
          id?: string
          max_members?: number | null
          members_count?: number | null
          name: string
          sponsor_themed?: boolean | null
          team_color?: string | null
          team_motto?: string | null
          team_power?: number | null
          updated_at?: string | null
        }
        Update: {
          achievements?: Json | null
          captain_id?: string | null
          created_at?: string | null
          description?: string | null
          district_id?: string
          id?: string
          max_members?: number | null
          members_count?: number | null
          name?: string
          sponsor_themed?: boolean | null
          team_color?: string | null
          team_motto?: string | null
          team_power?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "district_teams_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          battles_lost: number | null
          battles_won: number | null
          color_primary: string
          color_secondary: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          level_required: number
          name: string
          power_level: number | null
          referral_link: string | null
          special_power: string | null
          sponsor_company: string | null
          sponsor_logo_url: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          battles_lost?: number | null
          battles_won?: number | null
          color_primary: string
          color_secondary: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level_required?: number
          name: string
          power_level?: number | null
          referral_link?: string | null
          special_power?: string | null
          sponsor_company?: string | null
          sponsor_logo_url?: string | null
          theme: string
          updated_at?: string
        }
        Update: {
          battles_lost?: number | null
          battles_won?: number | null
          color_primary?: string
          color_secondary?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level_required?: number
          name?: string
          power_level?: number | null
          referral_link?: string | null
          special_power?: string | null
          sponsor_company?: string | null
          sponsor_logo_url?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      duel_invites: {
        Row: {
          bet_amount: number | null
          bet_status: string | null
          challenged_id: string
          challenger_id: string
          counter_bet_amount: number | null
          created_at: string
          expires_at: string
          id: string
          quiz_topic: string
          status: string
          topic: string
        }
        Insert: {
          bet_amount?: number | null
          bet_status?: string | null
          challenged_id: string
          challenger_id: string
          counter_bet_amount?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          quiz_topic: string
          status?: string
          topic?: string
        }
        Update: {
          bet_amount?: number | null
          bet_status?: string | null
          challenged_id?: string
          challenger_id?: string
          counter_bet_amount?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          quiz_topic?: string
          status?: string
          topic?: string
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
      duel_queue: {
        Row: {
          created_at: string
          district_id: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          preferred_topic: string | null
          skill_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          preferred_topic?: string | null
          skill_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          preferred_topic?: string | null
          skill_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      duels: {
        Row: {
          bet_amount: number | null
          created_at: string
          current_question: number | null
          finished_at: string | null
          id: string
          invite_id: string
          player1_answers: Json | null
          player1_current_question: number | null
          player1_finished_at: string | null
          player1_id: string
          player1_score: number | null
          player1_status: string | null
          player1_timeout_count: number | null
          player2_answers: Json | null
          player2_current_question: number | null
          player2_finished_at: string | null
          player2_id: string
          player2_score: number | null
          player2_status: string | null
          player2_timeout_count: number | null
          questions: Json
          quiz_topic: string
          status: string
          topic: string
          winner_id: string | null
          winner_prize: number | null
        }
        Insert: {
          bet_amount?: number | null
          created_at?: string
          current_question?: number | null
          finished_at?: string | null
          id?: string
          invite_id: string
          player1_answers?: Json | null
          player1_current_question?: number | null
          player1_finished_at?: string | null
          player1_id: string
          player1_score?: number | null
          player1_status?: string | null
          player1_timeout_count?: number | null
          player2_answers?: Json | null
          player2_current_question?: number | null
          player2_finished_at?: string | null
          player2_id: string
          player2_score?: number | null
          player2_status?: string | null
          player2_timeout_count?: number | null
          questions: Json
          quiz_topic: string
          status?: string
          topic?: string
          winner_id?: string | null
          winner_prize?: number | null
        }
        Update: {
          bet_amount?: number | null
          created_at?: string
          current_question?: number | null
          finished_at?: string | null
          id?: string
          invite_id?: string
          player1_answers?: Json | null
          player1_current_question?: number | null
          player1_finished_at?: string | null
          player1_id?: string
          player1_score?: number | null
          player1_status?: string | null
          player1_timeout_count?: number | null
          player2_answers?: Json | null
          player2_current_question?: number | null
          player2_finished_at?: string | null
          player2_id?: string
          player2_score?: number | null
          player2_status?: string | null
          player2_timeout_count?: number | null
          questions?: Json
          quiz_topic?: string
          status?: string
          topic?: string
          winner_id?: string | null
          winner_prize?: number | null
        }
        Relationships: [
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
      educational_concepts: {
        Row: {
          created_at: string | null
          description: string | null
          fundamental_level: number | null
          id: string
          learning_module_id: string | null
          name: string
          parent_concept_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fundamental_level?: number | null
          id?: string
          learning_module_id?: string | null
          name: string
          parent_concept_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fundamental_level?: number | null
          id?: string
          learning_module_id?: string | null
          name?: string
          parent_concept_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educational_concepts_learning_module_id_fkey"
            columns: ["learning_module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educational_concepts_parent_concept_id_fkey"
            columns: ["parent_concept_id"]
            isOneToOne: false
            referencedRelation: "educational_concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          end_time: string
          entry_requirements: Json | null
          event_data: Json | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          image_url: string | null
          max_participants: number | null
          name: string
          rewards: Json | null
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_time: string
          entry_requirements?: Json | null
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          max_participants?: number | null
          name: string
          rewards?: Json | null
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_time?: string
          entry_requirements?: Json | null
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          max_participants?: number | null
          name?: string
          rewards?: Json | null
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Relationships: []
      }
      guild_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          guild_id: string
          id: string
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          guild_id: string
          id?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_activities_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string | null
          total_contribution: number | null
          user_id: string
          weekly_contribution: number | null
        }
        Insert: {
          guild_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          total_contribution?: number | null
          user_id: string
          weekly_contribution?: number | null
        }
        Update: {
          guild_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          total_contribution?: number | null
          user_id?: string
          weekly_contribution?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          content: string
          created_at: string | null
          guild_id: string
          id: string
          is_deleted: boolean | null
          message_type: string | null
          reply_to_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          guild_id: string
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          guild_id?: string
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "guild_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_missions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          description: string | null
          expires_at: string | null
          guild_id: string
          id: string
          mission_type: string
          name: string
          rewards: Json | null
          status: string | null
          target_value: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          expires_at?: string | null
          guild_id: string
          id?: string
          mission_type: string
          name: string
          rewards?: Json | null
          status?: string | null
          target_value: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          expires_at?: string | null
          guild_id?: string
          id?: string
          mission_type?: string
          name?: string
          rewards?: Json | null
          status?: string | null
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_missions_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_requests: {
        Row: {
          created_at: string | null
          guild_id: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          guild_id: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          guild_id?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_requests_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string | null
          description: string | null
          emblem: string | null
          id: string
          is_recruiting: boolean | null
          leader_id: string
          level: number | null
          max_members: number | null
          member_count: number | null
          name: string
          perks: Json | null
          requirements: Json | null
          status: string | null
          updated_at: string | null
          weekly_goal: number | null
          weekly_progress: number | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          emblem?: string | null
          id?: string
          is_recruiting?: boolean | null
          leader_id: string
          level?: number | null
          max_members?: number | null
          member_count?: number | null
          name: string
          perks?: Json | null
          requirements?: Json | null
          status?: string | null
          updated_at?: string | null
          weekly_goal?: number | null
          weekly_progress?: number | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          emblem?: string | null
          id?: string
          is_recruiting?: boolean | null
          leader_id?: string
          level?: number | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          perks?: Json | null
          requirements?: Json | null
          status?: string | null
          updated_at?: string | null
          weekly_goal?: number | null
          weekly_progress?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guilds_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_queue_sessions: {
        Row: {
          auto_dismiss_at: string | null
          created_at: string | null
          id: string
          interaction_type: string | null
          invite_id: string
          priority_score: number | null
          processed_at: string | null
          queue_position: number
          user_id: string
        }
        Insert: {
          auto_dismiss_at?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          invite_id: string
          priority_score?: number | null
          processed_at?: string | null
          queue_position: number
          user_id: string
        }
        Update: {
          auto_dismiss_at?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          invite_id?: string
          priority_score?: number | null
          processed_at?: string | null
          queue_position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_queue_sessions_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "duel_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_queue_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      league_seasons: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          rewards: Json | null
          season_number: number
          start_date: string
          status: Database["public"]["Enums"]["season_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          rewards?: Json | null
          season_number: number
          start_date: string
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          rewards?: Json | null
          season_number?: number
          start_date?: string
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Relationships: []
      }
      leagues: {
        Row: {
          color_primary: string
          color_secondary: string
          created_at: string
          icon: string | null
          id: string
          max_points: number | null
          min_points: number
          name: string
          rewards: Json | null
          tier: number
        }
        Insert: {
          color_primary: string
          color_secondary: string
          created_at?: string
          icon?: string | null
          id?: string
          max_points?: number | null
          min_points: number
          name: string
          rewards?: Json | null
          tier: number
        }
        Update: {
          color_primary?: string
          color_secondary?: string
          created_at?: string
          icon?: string | null
          id?: string
          max_points?: number | null
          min_points?: number
          name?: string
          rewards?: Json | null
          tier?: number
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          analytics_date: string | null
          attention_span_minutes: number | null
          concepts_mastered: number | null
          created_at: string | null
          difficulty_preference: string | null
          id: string
          learning_style_data: Json | null
          learning_velocity: number | null
          optimal_time_of_day: string | null
          preferred_session_length: number | null
          questions_attempted: number | null
          questions_correct: number | null
          total_study_time_minutes: number | null
          user_id: string
        }
        Insert: {
          analytics_date?: string | null
          attention_span_minutes?: number | null
          concepts_mastered?: number | null
          created_at?: string | null
          difficulty_preference?: string | null
          id?: string
          learning_style_data?: Json | null
          learning_velocity?: number | null
          optimal_time_of_day?: string | null
          preferred_session_length?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          total_study_time_minutes?: number | null
          user_id: string
        }
        Update: {
          analytics_date?: string | null
          attention_span_minutes?: number | null
          concepts_mastered?: number | null
          created_at?: string | null
          difficulty_preference?: string | null
          id?: string
          learning_style_data?: Json | null
          learning_velocity?: number | null
          optimal_time_of_day?: string | null
          preferred_session_length?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          total_study_time_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          banner_image_url: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          estimated_duration_minutes: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          learning_objectives: string[] | null
          module_order: number | null
          name: string
          prerequisite_modules: string[] | null
          sponsor_company: string | null
          updated_at: string | null
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          module_order?: number | null
          name: string
          prerequisite_modules?: string[] | null
          sponsor_company?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          module_order?: number | null
          name?: string
          prerequisite_modules?: string[] | null
          sponsor_company?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity: string | null
          longest_streak: number | null
          module_id: string | null
          streak_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity?: string | null
          longest_streak?: number | null
          module_id?: string | null
          streak_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity?: string | null
          longest_streak?: number | null
          module_id?: string | null
          streak_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_streaks_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_lesson_date: string | null
          last_weekly_combo: string | null
          longest_streak: number
          total_lessons_completed: number
          updated_at: string
          user_id: string
          weekly_combo_count: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_lesson_date?: string | null
          last_weekly_combo?: string | null
          longest_streak?: number
          total_lessons_completed?: number
          updated_at?: string
          user_id: string
          weekly_combo_count?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_lesson_date?: string | null
          last_weekly_combo?: string | null
          longest_streak?: number
          total_lessons_completed?: number
          updated_at?: string
          user_id?: string
          weekly_combo_count?: number
        }
        Relationships: []
      }
      level_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          level: number
          name: string
          rewards: Json | null
          xp_required: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          level: number
          name: string
          rewards?: Json | null
          xp_required: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          level?: number
          name?: string
          rewards?: Json | null
          xp_required?: number
        }
        Relationships: []
      }
      life_packages: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          lives_count: number
          name: string
          price_cents: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          lives_count: number
          name: string
          price_cents: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          lives_count?: number
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      loot_boxes: {
        Row: {
          animation_url: string | null
          contents: Json
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          max_items: number
          min_items: number
          name: string
          rarity: string
        }
        Insert: {
          animation_url?: string | null
          contents?: Json
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_items?: number
          min_items?: number
          name: string
          rarity?: string
        }
        Update: {
          animation_url?: string | null
          contents?: Json
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_items?: number
          min_items?: number
          name?: string
          rarity?: string
        }
        Relationships: []
      }
      loot_items: {
        Row: {
          created_at: string
          description: string | null
          effect_data: Json | null
          id: string
          image_url: string | null
          lore_text: string | null
          name: string
          rarity: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          effect_data?: Json | null
          id?: string
          image_url?: string | null
          lore_text?: string | null
          name: string
          rarity?: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          effect_data?: Json | null
          id?: string
          image_url?: string | null
          lore_text?: string | null
          name?: string
          rarity?: string
          type?: string
        }
        Relationships: []
      }
      market_events: {
        Row: {
          activated_at: string | null
          affected_assets: string[] | null
          created_at: string
          description: string | null
          duration_hours: number | null
          event_type: string
          expires_at: string | null
          id: string
          impact_percentage: number
          is_active: boolean
          name: string
        }
        Insert: {
          activated_at?: string | null
          affected_assets?: string[] | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          event_type: string
          expires_at?: string | null
          id?: string
          impact_percentage: number
          is_active?: boolean
          name: string
        }
        Update: {
          activated_at?: string | null
          affected_assets?: string[] | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          event_type?: string
          expires_at?: string | null
          id?: string
          impact_percentage?: number
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          price_beetz: number
          seller_id: string
          updated_at: string
          user_collectible_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          price_beetz: number
          seller_id: string
          updated_at?: string
          user_collectible_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          price_beetz?: number
          seller_id?: string
          updated_at?: string
          user_collectible_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_user_collectible_id_fkey"
            columns: ["user_collectible_id"]
            isOneToOne: false
            referencedRelation: "user_collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_sales: {
        Row: {
          buyer_id: string
          completed_at: string
          created_at: string
          id: string
          listing_id: string | null
          platform_fee_beetz: number
          price_beetz: number
          seller_id: string
        }
        Insert: {
          buyer_id: string
          completed_at?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          platform_fee_beetz: number
          price_beetz: number
          seller_id: string
        }
        Update: {
          buyer_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          platform_fee_beetz?: number
          price_beetz?: number
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_sales_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_missions: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: number | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          learning_objectives: Json | null
          rewards: Json | null
          success_criteria: Json | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: Json | null
          rewards?: Json | null
          success_criteria?: Json | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: Json | null
          rewards?: Json | null
          success_criteria?: Json | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_relationships: {
        Row: {
          created_at: string
          ended_at: string | null
          goals: Json | null
          id: string
          mentee_id: string
          mentor_id: string
          progress: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["mentorship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          goals?: Json | null
          id?: string
          mentee_id: string
          mentor_id: string
          progress?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          goals?: Json | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          progress?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          media_url: string | null
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message_template: string
          name: string
          title_template: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message_template: string
          name: string
          title_template: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message_template?: string
          name?: string
          title_template?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_holdings: {
        Row: {
          asset_name: string
          asset_symbol: string
          asset_type: string
          avg_price: number
          created_at: string
          current_price: number | null
          id: string
          portfolio_id: string
          quantity: number
          total_value: number | null
          updated_at: string
        }
        Insert: {
          asset_name: string
          asset_symbol: string
          asset_type: string
          avg_price: number
          created_at?: string
          current_price?: number | null
          id?: string
          portfolio_id: string
          quantity: number
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          asset_name?: string
          asset_symbol?: string
          asset_type?: string
          avg_price?: number
          created_at?: string
          current_price?: number | null
          id?: string
          portfolio_id?: string
          quantity?: number
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_portfolio_holdings_portfolio"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          current_balance: number
          description: string | null
          district_theme: string | null
          followers_count: number | null
          id: string
          initial_balance: number
          is_public: boolean
          likes_count: number | null
          name: string
          performance_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          description?: string | null
          district_theme?: string | null
          followers_count?: number | null
          id?: string
          initial_balance?: number
          is_public?: boolean
          likes_count?: number | null
          name: string
          performance_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          description?: string | null
          district_theme?: string | null
          followers_count?: number | null
          id?: string
          initial_balance?: number
          is_public?: boolean
          likes_count?: number | null
          name?: string
          performance_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_portfolios_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
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
            foreignKeyName: "fk_post_comments_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
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
            foreignKeyName: "fk_post_likes_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      power_ups: {
        Row: {
          created_at: string
          description: string | null
          effect_value: number
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          rarity: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          effect_value?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price?: number
          rarity?: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          effect_value?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          rarity?: string
          type?: string
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      privacy_access_log: {
        Row: {
          access_type: string
          accessed_table: string
          accessed_user_id: string | null
          accessor_user_id: string | null
          created_at: string | null
          denied: boolean | null
          id: string
        }
        Insert: {
          access_type: string
          accessed_table: string
          accessed_user_id?: string | null
          accessor_user_id?: string | null
          created_at?: string | null
          denied?: boolean | null
          id?: string
        }
        Update: {
          access_type?: string
          accessed_table?: string
          accessed_user_id?: string | null
          accessor_user_id?: string | null
          created_at?: string | null
          denied?: boolean | null
          id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_hours: number | null
          effects: Json | null
          exclusive_district_id: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_district_exclusive: boolean | null
          level_required: number
          name: string
          price: number
          rarity: string
          sponsor_branded: boolean | null
          unlock_requirements: Json | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          effects?: Json | null
          exclusive_district_id?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_district_exclusive?: boolean | null
          level_required?: number
          name: string
          price?: number
          rarity?: string
          sponsor_branded?: boolean | null
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          effects?: Json | null
          exclusive_district_id?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_district_exclusive?: boolean | null
          level_required?: number
          name?: string
          price?: number
          rarity?: string
          sponsor_branded?: boolean | null
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_exclusive_district_id_fkey"
            columns: ["exclusive_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_banners: {
        Row: {
          animation_data: Json | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          is_animated: boolean | null
          is_premium: boolean | null
          name: string
          price_beetz: number | null
          rarity: string
          unlock_requirement: Json
        }
        Insert: {
          animation_data?: Json | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          is_animated?: boolean | null
          is_premium?: boolean | null
          name: string
          price_beetz?: number | null
          rarity?: string
          unlock_requirement?: Json
        }
        Update: {
          animation_data?: Json | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_animated?: boolean | null
          is_premium?: boolean | null
          name?: string
          price_beetz?: number | null
          rarity?: string
          unlock_requirement?: Json
        }
        Relationships: []
      }
      profile_titles: {
        Row: {
          animation_type: string | null
          color_scheme: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_animated: boolean | null
          rarity: string
          title: string
          unlock_requirement: Json
        }
        Insert: {
          animation_type?: string | null
          color_scheme?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_animated?: boolean | null
          rarity?: string
          title: string
          unlock_requirement?: Json
        }
        Update: {
          animation_type?: string | null
          color_scheme?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_animated?: boolean | null
          rarity?: string
          title?: string
          unlock_requirement?: Json
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown | null
          profile_id: string
          user_agent: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          profile_id: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          profile_id?: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_views_profile_id"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_banner_id: string | null
          active_frame_id: string | null
          active_title_id: string | null
          avatar_id: string | null
          completed_lessons: number | null
          consecutive_login_days: number | null
          created_at: string
          current_avatar_id: string | null
          current_streak_multiplier: number | null
          daily_duels_reset_date: string | null
          daily_duels_used: number | null
          financial_goal: string | null
          id: string
          is_bot: boolean | null
          last_daily_login_date: string | null
          last_login_date: string | null
          last_streak_reset_date: string | null
          last_yield_date: string | null
          level: number | null
          nickname: string
          points: number
          profile_image_url: string | null
          profile_views_count: number | null
          protected_btz: number | null
          skill_rating: number | null
          srs_enabled: boolean | null
          streak: number | null
          streak_session_active: boolean | null
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_yield_earned: number | null
          updated_at: string
          user_id: string
          xp: number | null
          yield_rate: number | null
        }
        Insert: {
          active_banner_id?: string | null
          active_frame_id?: string | null
          active_title_id?: string | null
          avatar_id?: string | null
          completed_lessons?: number | null
          consecutive_login_days?: number | null
          created_at?: string
          current_avatar_id?: string | null
          current_streak_multiplier?: number | null
          daily_duels_reset_date?: string | null
          daily_duels_used?: number | null
          financial_goal?: string | null
          id?: string
          is_bot?: boolean | null
          last_daily_login_date?: string | null
          last_login_date?: string | null
          last_streak_reset_date?: string | null
          last_yield_date?: string | null
          level?: number | null
          nickname: string
          points?: number
          profile_image_url?: string | null
          profile_views_count?: number | null
          protected_btz?: number | null
          skill_rating?: number | null
          srs_enabled?: boolean | null
          streak?: number | null
          streak_session_active?: boolean | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_yield_earned?: number | null
          updated_at?: string
          user_id: string
          xp?: number | null
          yield_rate?: number | null
        }
        Update: {
          active_banner_id?: string | null
          active_frame_id?: string | null
          active_title_id?: string | null
          avatar_id?: string | null
          completed_lessons?: number | null
          consecutive_login_days?: number | null
          created_at?: string
          current_avatar_id?: string | null
          current_streak_multiplier?: number | null
          daily_duels_reset_date?: string | null
          daily_duels_used?: number | null
          financial_goal?: string | null
          id?: string
          is_bot?: boolean | null
          last_daily_login_date?: string | null
          last_login_date?: string | null
          last_streak_reset_date?: string | null
          last_yield_date?: string | null
          level?: number | null
          nickname?: string
          points?: number
          profile_image_url?: string | null
          profile_views_count?: number | null
          protected_btz?: number | null
          skill_rating?: number | null
          srs_enabled?: boolean | null
          streak?: number | null
          streak_session_active?: boolean | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          total_yield_earned?: number | null
          updated_at?: string
          user_id?: string
          xp?: number | null
          yield_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_banner_id_fkey"
            columns: ["active_banner_id"]
            isOneToOne: false
            referencedRelation: "profile_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_active_frame_id_fkey"
            columns: ["active_frame_id"]
            isOneToOne: false
            referencedRelation: "avatar_frames"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_active_title_id_fkey"
            columns: ["active_title_id"]
            isOneToOne: false
            referencedRelation: "profile_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_avatar_id_fkey"
            columns: ["current_avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_logs: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notification_settings: {
        Row: {
          auth_key: string | null
          created_at: string
          enabled: boolean
          endpoint: string | null
          id: string
          p256dh_key: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key?: string | null
          created_at?: string
          enabled?: boolean
          endpoint?: string | null
          id?: string
          p256dh_key?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string | null
          created_at?: string
          enabled?: boolean
          endpoint?: string | null
          id?: string
          p256dh_key?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_push_settings_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_concepts: {
        Row: {
          concept_id: string
          id: string
          question_id: string
          relevance_weight: number | null
        }
        Insert: {
          concept_id: string
          id?: string
          question_id: string
          relevance_weight?: number | null
        }
        Update: {
          concept_id?: string
          id?: string
          question_id?: string
          relevance_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_concepts_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "educational_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_concepts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_hashes: {
        Row: {
          created_at: string | null
          difficulty: string
          id: string
          question_hash: string
          question_id: string | null
          theme: string
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          id?: string
          question_hash: string
          question_id?: string | null
          theme: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          id?: string
          question_hash?: string
          question_id?: string | null
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_hashes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_imports: {
        Row: {
          created_at: string | null
          failed_imports: number | null
          file_name: string
          id: string
          learning_module_id: string | null
          processed_at: string | null
          status: string | null
          successful_imports: number | null
          total_questions: number | null
          uploaded_by: string
          validation_errors: Json | null
        }
        Insert: {
          created_at?: string | null
          failed_imports?: number | null
          file_name: string
          id?: string
          learning_module_id?: string | null
          processed_at?: string | null
          status?: string | null
          successful_imports?: number | null
          total_questions?: number | null
          uploaded_by: string
          validation_errors?: Json | null
        }
        Update: {
          created_at?: string | null
          failed_imports?: number | null
          file_name?: string
          id?: string
          learning_module_id?: string | null
          processed_at?: string | null
          status?: string | null
          successful_imports?: number | null
          total_questions?: number | null
          uploaded_by?: string
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "question_imports_learning_module_id_fkey"
            columns: ["learning_module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      question_stats: {
        Row: {
          avg_time_ms: number
          correct: number
          plays: number
          question_id: string
          updated_at: string
          wrong: number
        }
        Insert: {
          avg_time_ms?: number
          correct?: number
          plays?: number
          question_id: string
          updated_at?: string
          wrong?: number
        }
        Update: {
          avg_time_ms?: number
          correct?: number
          plays?: number
          question_id?: string
          updated_at?: string
          wrong?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_stats_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          explanation: string
          id: string
          is_active: boolean
          lang: string
          option_a: string
          option_b: string
          option_c: string
          question: string
          slug: string | null
          source: string | null
          subtopic: string | null
          tags: string[] | null
          topic: Database["public"]["Enums"]["quiz_topic"]
        }
        Insert: {
          created_at?: string
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          explanation: string
          id?: string
          is_active?: boolean
          lang?: string
          option_a: string
          option_b: string
          option_c: string
          question: string
          slug?: string | null
          source?: string | null
          subtopic?: string | null
          tags?: string[] | null
          topic: Database["public"]["Enums"]["quiz_topic"]
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          explanation?: string
          id?: string
          is_active?: boolean
          lang?: string
          option_a?: string
          option_b?: string
          option_c?: string
          question?: string
          slug?: string | null
          source?: string | null
          subtopic?: string | null
          tags?: string[] | null
          topic?: Database["public"]["Enums"]["quiz_topic"]
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          approval_status: string | null
          approved_by: string | null
          author_notes: string | null
          avg_response_time: number | null
          category: string
          cognitive_level: string | null
          concepts: string[] | null
          correct_answer: string
          created_at: string
          difficulty: string
          difficulty_level: number | null
          district_id: string | null
          estimated_time_seconds: number | null
          explanation: string | null
          feedback_wrong_answers: Json | null
          id: string
          is_approved: boolean | null
          last_reviewed_date: string | null
          learning_module_id: string | null
          learning_objectives: string[] | null
          options: Json
          question: string
          question_type: string | null
          source_material: string | null
          success_rate: number | null
          tags: string[] | null
          theme: string | null
          updated_at: string
          usage_count: number | null
          version: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_by?: string | null
          author_notes?: string | null
          avg_response_time?: number | null
          category: string
          cognitive_level?: string | null
          concepts?: string[] | null
          correct_answer: string
          created_at?: string
          difficulty: string
          difficulty_level?: number | null
          district_id?: string | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          feedback_wrong_answers?: Json | null
          id?: string
          is_approved?: boolean | null
          last_reviewed_date?: string | null
          learning_module_id?: string | null
          learning_objectives?: string[] | null
          options: Json
          question: string
          question_type?: string | null
          source_material?: string | null
          success_rate?: number | null
          tags?: string[] | null
          theme?: string | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_by?: string | null
          author_notes?: string | null
          avg_response_time?: number | null
          category?: string
          cognitive_level?: string | null
          concepts?: string[] | null
          correct_answer?: string
          created_at?: string
          difficulty?: string
          difficulty_level?: number | null
          district_id?: string | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          feedback_wrong_answers?: Json | null
          id?: string
          is_approved?: boolean | null
          last_reviewed_date?: string | null
          learning_module_id?: string | null
          learning_objectives?: string[] | null
          options?: Json
          question?: string
          question_type?: string | null
          source_material?: string | null
          success_rate?: number | null
          tags?: string[] | null
          theme?: string | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_learning_module_id_fkey"
            columns: ["learning_module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions_legacy: {
        Row: {
          approved_by: string | null
          author_notes: string | null
          avg_response_time: number | null
          backup_date: string | null
          backup_reason: string | null
          category: string
          cognitive_level: string | null
          concepts: string[] | null
          correct_answer: string
          created_at: string
          difficulty: string
          difficulty_level: number | null
          district_id: string | null
          estimated_time_seconds: number | null
          explanation: string | null
          id: string
          is_approved: boolean | null
          learning_module_id: string | null
          learning_objectives: string[] | null
          migrated_from_original: boolean | null
          options: Json
          question: string
          question_type: string | null
          source_material: string | null
          success_rate: number | null
          tags: string[] | null
          updated_at: string
          usage_count: number | null
          version: number | null
        }
        Insert: {
          approved_by?: string | null
          author_notes?: string | null
          avg_response_time?: number | null
          backup_date?: string | null
          backup_reason?: string | null
          category: string
          cognitive_level?: string | null
          concepts?: string[] | null
          correct_answer: string
          created_at?: string
          difficulty: string
          difficulty_level?: number | null
          district_id?: string | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          id?: string
          is_approved?: boolean | null
          learning_module_id?: string | null
          learning_objectives?: string[] | null
          migrated_from_original?: boolean | null
          options?: Json
          question: string
          question_type?: string | null
          source_material?: string | null
          success_rate?: number | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          approved_by?: string | null
          author_notes?: string | null
          avg_response_time?: number | null
          backup_date?: string | null
          backup_reason?: string | null
          category?: string
          cognitive_level?: string | null
          concepts?: string[] | null
          correct_answer?: string
          created_at?: string
          difficulty?: string
          difficulty_level?: number | null
          district_id?: string | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          id?: string
          is_approved?: boolean | null
          learning_module_id?: string | null
          learning_objectives?: string[] | null
          migrated_from_original?: boolean | null
          options?: Json
          question?: string
          question_type?: string | null
          source_material?: string | null
          success_rate?: number | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          combo_count: number | null
          completed_at: string | null
          created_at: string
          difficulty: string | null
          id: string
          loot_earned: Json | null
          max_combo: number | null
          performance_score: number | null
          power_ups_used: Json | null
          questions_correct: number
          questions_data: Json | null
          questions_incorrect: number
          questions_total: number
          session_type: string
          time_spent: number | null
          user_id: string
        }
        Insert: {
          combo_count?: number | null
          completed_at?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          loot_earned?: Json | null
          max_combo?: number | null
          performance_score?: number | null
          power_ups_used?: Json | null
          questions_correct?: number
          questions_data?: Json | null
          questions_incorrect?: number
          questions_total?: number
          session_type?: string
          time_spent?: number | null
          user_id: string
        }
        Update: {
          combo_count?: number | null
          completed_at?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          loot_earned?: Json | null
          max_combo?: number | null
          performance_score?: number | null
          power_ups_used?: Json | null
          questions_correct?: number
          questions_data?: Json | null
          questions_incorrect?: number
          questions_total?: number
          session_type?: string
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          ends_at: string
          id: string
          is_active: boolean
          reward_points: number
          starts_at: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          ends_at: string
          id?: string
          is_active?: boolean
          reward_points?: number
          starts_at?: string
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          reward_points?: number
          starts_at?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_flagged: boolean | null
          likes_count: number
          media_url: string | null
          post_type: string
          trade_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_flagged?: boolean | null
          likes_count?: number
          media_url?: string | null
          post_type?: string
          trade_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_flagged?: boolean | null
          likes_count?: number
          media_url?: string | null
          post_type?: string
          trade_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_social_posts_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_admin_access: {
        Row: {
          access_level: string | null
          district_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          user_id: string
        }
        Insert: {
          access_level?: string | null
          district_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          user_id: string
        }
        Update: {
          access_level?: string | null
          district_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_admin_access_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_admin_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_admin_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_events: {
        Row: {
          banner_image_url: string | null
          created_at: string | null
          created_by: string
          current_participants: number | null
          description: string | null
          district_id: string
          end_date: string
          event_type: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          requirements: Json | null
          rewards: Json | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string | null
          created_by: string
          current_participants?: number | null
          description?: string | null
          district_id: string
          end_date: string
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          requirements?: Json | null
          rewards?: Json | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string | null
          created_by?: string
          current_participants?: number | null
          description?: string | null
          district_id?: string
          end_date?: string
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          requirements?: Json | null
          rewards?: Json | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_events_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_referrals: {
        Row: {
          commission_amount: number | null
          created_at: string | null
          district_id: string
          id: string
          processed_at: string | null
          referral_data: Json | null
          referral_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string | null
          district_id: string
          id?: string
          processed_at?: string | null
          referral_data?: Json | null
          referral_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          commission_amount?: number | null
          created_at?: string | null
          district_id?: string
          id?: string
          processed_at?: string | null
          referral_data?: Json | null
          referral_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_referrals_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          description: string | null
          discount_percentage: number | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          product_type: Database["public"]["Enums"]["product_type"]
          stripe_price_id: string | null
          updated_at: string
          virtual_reward: Json | null
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          discount_percentage?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          product_type: Database["public"]["Enums"]["product_type"]
          stripe_price_id?: string | null
          updated_at?: string
          virtual_reward?: Json | null
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          description?: string | null
          discount_percentage?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          stripe_price_id?: string | null
          updated_at?: string
          virtual_reward?: Json | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_story_views_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number
          price_yearly?: number | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          contribution_points: number | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          contribution_points?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          contribution_points?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "district_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          district_id: string
          id: string
          image_url: string | null
          level_required: number
          max_members: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          district_id: string
          id?: string
          image_url?: string | null
          level_required?: number
          max_members?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          district_id?: string
          id?: string
          image_url?: string | null
          level_required?: number
          max_members?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      themed_loot_boxes: {
        Row: {
          animation_url: string | null
          contents: Json
          cost_beetz: number | null
          cost_real_money: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          max_items: number | null
          min_items: number | null
          name: string
          rarity: Database["public"]["Enums"]["powerup_rarity"]
          theme: string
          unlock_requirements: Json | null
          updated_at: string
        }
        Insert: {
          animation_url?: string | null
          contents?: Json
          cost_beetz?: number | null
          cost_real_money?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          max_items?: number | null
          min_items?: number | null
          name: string
          rarity?: Database["public"]["Enums"]["powerup_rarity"]
          theme: string
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          animation_url?: string | null
          contents?: Json
          cost_beetz?: number | null
          cost_real_money?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          max_items?: number | null
          min_items?: number | null
          name?: string
          rarity?: Database["public"]["Enums"]["powerup_rarity"]
          theme?: string
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          completed_at: string | null
          id: string
          joined_at: string | null
          prize_won: number | null
          rank: number | null
          score: number | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          prize_won?: number | null
          rank?: number | null
          score?: number | null
          tournament_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          prize_won?: number | null
          rank?: number | null
          score?: number | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participations: {
        Row: {
          bracket_position: number | null
          current_round: number | null
          final_position: number | null
          id: string
          is_eliminated: boolean | null
          joined_at: string
          losses: number | null
          prizes_won: Json | null
          total_score: number | null
          tournament_id: string
          user_id: string
          wins: number | null
        }
        Insert: {
          bracket_position?: number | null
          current_round?: number | null
          final_position?: number | null
          id?: string
          is_eliminated?: boolean | null
          joined_at?: string
          losses?: number | null
          prizes_won?: Json | null
          total_score?: number | null
          tournament_id: string
          user_id: string
          wins?: number | null
        }
        Update: {
          bracket_position?: number | null
          current_round?: number | null
          final_position?: number | null
          id?: string
          is_eliminated?: boolean | null
          joined_at?: string
          losses?: number | null
          prizes_won?: Json | null
          total_score?: number | null
          tournament_id?: string
          user_id?: string
          wins?: number | null
        }
        Relationships: []
      }
      tournament_rewards: {
        Row: {
          created_at: string | null
          id: string
          rank_position: number
          reward_image_url: string | null
          reward_type: string
          reward_value: string
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rank_position: number
          reward_image_url?: string | null
          reward_type: string
          reward_value: string
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rank_position?: number
          reward_image_url?: string | null
          reward_type?: string
          reward_value?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rewards_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          end_date: string
          entry_fee: number | null
          id: string
          max_participants: number | null
          name: string
          prize_pool: number | null
          start_date: string
          status: string
          theme: string
          trophy_image_url: string | null
          trophy_name: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          name: string
          prize_pool?: number | null
          start_date: string
          status?: string
          theme: string
          trophy_image_url?: string | null
          trophy_name?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          name?: string
          prize_pool?: number | null
          start_date?: string
          status?: string
          theme?: string
          trophy_image_url?: string | null
          trophy_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trading_leaderboards: {
        Row: {
          created_at: string
          ending_balance: number | null
          id: string
          period_end: string | null
          period_start: string
          portfolio_id: string
          profit_loss: number | null
          profit_loss_percentage: number | null
          rank_position: number | null
          starting_balance: number | null
          timeframe: string | null
          trades_count: number | null
          user_id: string
          win_rate: number | null
        }
        Insert: {
          created_at?: string
          ending_balance?: number | null
          id?: string
          period_end?: string | null
          period_start: string
          portfolio_id: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          rank_position?: number | null
          starting_balance?: number | null
          timeframe?: string | null
          trades_count?: number | null
          user_id: string
          win_rate?: number | null
        }
        Update: {
          created_at?: string
          ending_balance?: number | null
          id?: string
          period_end?: string | null
          period_start?: string
          portfolio_id?: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          rank_position?: number | null
          starting_balance?: number | null
          timeframe?: string | null
          trades_count?: number | null
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          id: string
          processed_at: string | null
          product_id: string | null
          receiver_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          transfer_type: string | null
          updated_at: string
          user_id: string
          virtual_rewards_data: Json | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          processed_at?: string | null
          product_id?: string | null
          receiver_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transfer_type?: string | null
          updated_at?: string
          user_id: string
          virtual_rewards_data?: Json | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: string
          processed_at?: string | null
          product_id?: string | null
          receiver_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transfer_type?: string | null
          updated_at?: string
          user_id?: string
          virtual_rewards_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unlockable_content: {
        Row: {
          asset_url: string | null
          cost_beetz: number | null
          cost_real_money: number | null
          created_at: string
          customization_type: Database["public"]["Enums"]["customization_type"]
          description: string | null
          id: string
          is_available: boolean | null
          is_premium: boolean | null
          name: string
          preview_url: string | null
          rarity: Database["public"]["Enums"]["powerup_rarity"]
          unlock_requirements: Json | null
          updated_at: string
        }
        Insert: {
          asset_url?: string | null
          cost_beetz?: number | null
          cost_real_money?: number | null
          created_at?: string
          customization_type: Database["public"]["Enums"]["customization_type"]
          description?: string | null
          id?: string
          is_available?: boolean | null
          is_premium?: boolean | null
          name: string
          preview_url?: string | null
          rarity?: Database["public"]["Enums"]["powerup_rarity"]
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          asset_url?: string | null
          cost_beetz?: number | null
          cost_real_money?: number | null
          created_at?: string
          customization_type?: Database["public"]["Enums"]["customization_type"]
          description?: string | null
          id?: string
          is_available?: boolean | null
          is_premium?: boolean | null
          name?: string
          preview_url?: string | null
          rarity?: Database["public"]["Enums"]["powerup_rarity"]
          unlock_requirements?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_advanced_powerups: {
        Row: {
          acquired_at: string
          id: string
          last_used_at: string | null
          powerup_id: string
          quantity: number
          user_id: string
          uses_today: number | null
        }
        Insert: {
          acquired_at?: string
          id?: string
          last_used_at?: string | null
          powerup_id: string
          quantity?: number
          user_id: string
          uses_today?: number | null
        }
        Update: {
          acquired_at?: string
          id?: string
          last_used_at?: string | null
          powerup_id?: string
          quantity?: number
          user_id?: string
          uses_today?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_advanced_powerups_powerup_id_fkey"
            columns: ["powerup_id"]
            isOneToOne: false
            referencedRelation: "advanced_powerups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatar_frames: {
        Row: {
          frame_id: string
          id: string
          is_active: boolean | null
          unlock_method: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          frame_id: string
          id?: string
          is_active?: boolean | null
          unlock_method?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          frame_id?: string
          id?: string
          is_active?: boolean | null
          unlock_method?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_avatar_frames_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_avatar_frames_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "avatar_frames"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatar_items: {
        Row: {
          id: string
          item_id: string
          unlock_method: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          unlock_method?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          unlock_method?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_avatar_items_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_avatar_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatars: {
        Row: {
          avatar_id: string
          evolution_level: number | null
          id: string
          is_active: boolean
          purchased_at: string
          total_xp: number | null
          user_id: string
        }
        Insert: {
          avatar_id: string
          evolution_level?: number | null
          id?: string
          is_active?: boolean
          purchased_at?: string
          total_xp?: number | null
          user_id: string
        }
        Update: {
          avatar_id?: string
          evolution_level?: number | null
          id?: string
          is_active?: boolean
          purchased_at?: string
          total_xp?: number | null
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
      user_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_badges_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_challenge_progress_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "social_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collectibles: {
        Row: {
          acquired_at: string
          collectible_id: string | null
          created_at: string
          id: string
          is_listed_for_sale: boolean | null
          sale_price_beetz: number | null
          token_id: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string
          collectible_id?: string | null
          created_at?: string
          id?: string
          is_listed_for_sale?: boolean | null
          sale_price_beetz?: number | null
          token_id?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string
          collectible_id?: string | null
          created_at?: string
          id?: string
          is_listed_for_sale?: boolean | null
          sale_price_beetz?: number | null
          token_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collectibles_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "collectible_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_combo_records: {
        Row: {
          achieved_at: string | null
          best_value: number | null
          combo_achievement_id: string
          created_at: string
          current_value: number | null
          id: string
          total_completions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          best_value?: number | null
          combo_achievement_id: string
          created_at?: string
          current_value?: number | null
          id?: string
          total_completions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          best_value?: number | null
          combo_achievement_id?: string
          created_at?: string
          current_value?: number | null
          id?: string
          total_completions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_combo_records_combo_achievement_id_fkey"
            columns: ["combo_achievement_id"]
            isOneToOne: false
            referencedRelation: "combo_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_concept_mastery: {
        Row: {
          concept_id: string
          correct_responses: number | null
          created_at: string | null
          id: string
          last_reviewed: string | null
          learning_strength: number | null
          mastery_level: number | null
          next_review: string | null
          total_exposures: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          concept_id: string
          correct_responses?: number | null
          created_at?: string | null
          id?: string
          last_reviewed?: string | null
          learning_strength?: number | null
          mastery_level?: number | null
          next_review?: string | null
          total_exposures?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          concept_id?: string
          correct_responses?: number | null
          created_at?: string | null
          id?: string
          last_reviewed?: string | null
          learning_strength?: number | null
          mastery_level?: number | null
          next_review?: string | null
          total_exposures?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_concept_mastery_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "educational_concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_customizations: {
        Row: {
          content_id: string
          id: string
          is_equipped: boolean | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          id?: string
          is_equipped?: boolean | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          id?: string
          is_equipped?: boolean | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_customizations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "unlockable_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_lesson_modal: {
        Row: {
          created_at: string
          id: string
          last_shown_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_shown_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_districts: {
        Row: {
          daily_streak: number | null
          district_benefits: Json | null
          district_id: string
          id: string
          is_residence: boolean
          joined_at: string
          last_activity_date: string | null
          level: number
          monthly_battles_participated: number | null
          power_contribution: number | null
          residence_started_at: string | null
          team_id: string | null
          user_id: string
          xp: number
        }
        Insert: {
          daily_streak?: number | null
          district_benefits?: Json | null
          district_id: string
          id?: string
          is_residence?: boolean
          joined_at?: string
          last_activity_date?: string | null
          level?: number
          monthly_battles_participated?: number | null
          power_contribution?: number | null
          residence_started_at?: string | null
          team_id?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          daily_streak?: number | null
          district_benefits?: Json | null
          district_id?: string
          id?: string
          is_residence?: boolean
          joined_at?: string
          last_activity_date?: string | null
          level?: number
          monthly_battles_participated?: number | null
          power_contribution?: number | null
          residence_started_at?: string | null
          team_id?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_districts_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_districts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "district_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_event_participation: {
        Row: {
          completion_data: Json | null
          event_id: string
          id: string
          joined_at: string
          rank: number | null
          rewards_claimed: boolean | null
          score: number | null
          user_id: string
        }
        Insert: {
          completion_data?: Json | null
          event_id: string
          id?: string
          joined_at?: string
          rank?: number | null
          rewards_claimed?: boolean | null
          score?: number | null
          user_id: string
        }
        Update: {
          completion_data?: Json | null
          event_id?: string
          id?: string
          joined_at?: string
          rank?: number | null
          rewards_claimed?: boolean | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_event_participation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "game_events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_follows_follower"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_follows_following"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_leagues: {
        Row: {
          created_at: string
          current_tier: Database["public"]["Enums"]["league_tier"]
          demotion_count: number | null
          id: string
          peak_tier: Database["public"]["Enums"]["league_tier"] | null
          promotion_count: number | null
          season_id: string
          tier_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tier?: Database["public"]["Enums"]["league_tier"]
          demotion_count?: number | null
          id?: string
          peak_tier?: Database["public"]["Enums"]["league_tier"] | null
          promotion_count?: number | null
          season_id: string
          tier_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tier?: Database["public"]["Enums"]["league_tier"]
          demotion_count?: number | null
          id?: string
          peak_tier?: Database["public"]["Enums"]["league_tier"] | null
          promotion_count?: number | null
          season_id?: string
          tier_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_leagues_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "league_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          btz_earned: number
          created_at: string
          id: string
          lesson_id: string
          quiz_completed: boolean
          quiz_correct: boolean | null
          user_id: string
          viewed_at: string | null
          xp_earned: number
        }
        Insert: {
          btz_earned?: number
          created_at?: string
          id?: string
          lesson_id: string
          quiz_completed?: boolean
          quiz_correct?: boolean | null
          user_id: string
          viewed_at?: string | null
          xp_earned?: number
        }
        Update: {
          btz_earned?: number
          created_at?: string
          id?: string
          lesson_id?: string
          quiz_completed?: boolean
          quiz_correct?: boolean | null
          user_id?: string
          viewed_at?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "daily_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_likes_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lives: {
        Row: {
          created_at: string
          id: string
          last_life_recovery: string | null
          lives_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_life_recovery?: string | null
          lives_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_life_recovery?: string | null
          lives_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_loot: {
        Row: {
          acquired_at: string
          id: string
          loot_item_id: string
          source: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          loot_item_id: string
          source?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          loot_item_id?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_loot_loot_item_id_fkey"
            columns: ["loot_item_id"]
            isOneToOne: false
            referencedRelation: "loot_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_loot_boxes: {
        Row: {
          created_at: string
          id: string
          items_received: Json | null
          loot_box_id: string
          opened: boolean
          opened_at: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items_received?: Json | null
          loot_box_id: string
          opened?: boolean
          opened_at?: string | null
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items_received?: Json | null
          loot_box_id?: string
          opened?: boolean
          opened_at?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_loot_boxes_loot_box_id_fkey"
            columns: ["loot_box_id"]
            isOneToOne: false
            referencedRelation: "loot_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_loot_history: {
        Row: {
          id: string
          items_received: Json
          loot_box_id: string
          opened_at: string
          source: string | null
          user_id: string
        }
        Insert: {
          id?: string
          items_received?: Json
          loot_box_id: string
          opened_at?: string
          source?: string | null
          user_id: string
        }
        Update: {
          id?: string
          items_received?: Json
          loot_box_id?: string
          opened_at?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_loot_history_loot_box_id_fkey"
            columns: ["loot_box_id"]
            isOneToOne: false
            referencedRelation: "themed_loot_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_matchmaking_preferences: {
        Row: {
          allow_bots: boolean | null
          auto_accept_from_friends: boolean | null
          availability_status: string | null
          created_at: string | null
          id: string
          max_concurrent_invites: number | null
          preferred_topics: string[] | null
          skill_level_range: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_bots?: boolean | null
          auto_accept_from_friends?: boolean | null
          availability_status?: string | null
          created_at?: string | null
          id?: string
          max_concurrent_invites?: number | null
          preferred_topics?: string[] | null
          skill_level_range?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_bots?: boolean | null
          auto_accept_from_friends?: boolean | null
          availability_status?: string | null
          created_at?: string | null
          id?: string
          max_concurrent_invites?: number | null
          preferred_topics?: string[] | null
          skill_level_range?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_matchmaking_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mission_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          progress: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          progress?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "daily_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          adaptive_next_lesson: number | null
          completed_at: string | null
          current_lesson: number | null
          difficulty_preference: string | null
          id: string
          is_completed: boolean | null
          last_accessed: string | null
          mastery_score: number | null
          module_id: string
          personalized_path: Json | null
          started_at: string | null
          time_spent_minutes: number | null
          total_lessons: number | null
          user_id: string
        }
        Insert: {
          adaptive_next_lesson?: number | null
          completed_at?: string | null
          current_lesson?: number | null
          difficulty_preference?: string | null
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          mastery_score?: number | null
          module_id: string
          personalized_path?: Json | null
          started_at?: string | null
          time_spent_minutes?: number | null
          total_lessons?: number | null
          user_id: string
        }
        Update: {
          adaptive_next_lesson?: number | null
          completed_at?: string | null
          current_lesson?: number | null
          difficulty_preference?: string | null
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          mastery_score?: number | null
          module_id?: string
          personalized_path?: Json | null
          started_at?: string | null
          time_spent_minutes?: number | null
          total_lessons?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_profiles: {
        Row: {
          available_time_minutes: number | null
          completed_at: string | null
          created_at: string | null
          experience_level: string
          id: string
          learning_style: string | null
          motivation_factors: string[] | null
          preferred_difficulty: string | null
          study_goals: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_time_minutes?: number | null
          completed_at?: string | null
          created_at?: string | null
          experience_level: string
          id?: string
          learning_style?: string | null
          motivation_factors?: string[] | null
          preferred_difficulty?: string | null
          study_goals?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_time_minutes?: number | null
          completed_at?: string | null
          created_at?: string | null
          experience_level?: string
          id?: string
          learning_style?: string | null
          motivation_factors?: string[] | null
          preferred_difficulty?: string | null
          study_goals?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance_analytics: {
        Row: {
          achievements_earned: number | null
          average_response_time_ms: number | null
          correct_answers: number | null
          created_at: string
          id: string
          metric_date: string
          powerups_used: number | null
          questions_answered: number | null
          social_interactions: number | null
          streak_days: number | null
          total_study_time_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_earned?: number | null
          average_response_time_ms?: number | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          powerups_used?: number | null
          questions_answered?: number | null
          social_interactions?: number | null
          streak_days?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_earned?: number | null
          average_response_time_ms?: number | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          metric_date?: string
          powerups_used?: number | null
          questions_answered?: number | null
          social_interactions?: number | null
          streak_days?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pets: {
        Row: {
          acquired_at: string
          current_evolution: number
          evolution_date: string | null
          id: string
          is_active: boolean | null
          nickname: string | null
          pet_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          current_evolution?: number
          evolution_date?: string | null
          id?: string
          is_active?: boolean | null
          nickname?: string | null
          pet_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          current_evolution?: number
          evolution_date?: string | null
          id?: string
          is_active?: boolean | null
          nickname?: string | null
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_pets_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "avatar_pets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_power_ups: {
        Row: {
          acquired_at: string
          id: string
          power_up_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          power_up_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          power_up_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_power_ups_power_up_id_fkey"
            columns: ["power_up_id"]
            isOneToOne: false
            referencedRelation: "power_ups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          available_for_duel: boolean | null
          id: string
          is_online: boolean
          last_heartbeat: string | null
          last_seen: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_for_duel?: boolean | null
          id?: string
          is_online?: boolean
          last_heartbeat?: string | null
          last_seen?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_for_duel?: boolean | null
          id?: string
          is_online?: boolean
          last_heartbeat?: string | null
          last_seen?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_presence_user"
            columns: ["user_id"]
            isOneToOne: true
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
      user_profile_banners: {
        Row: {
          banner_id: string
          id: string
          unlock_method: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          banner_id: string
          id?: string
          unlock_method?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          banner_id?: string
          id?: string
          unlock_method?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profile_banners_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_banners_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "profile_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_titles: {
        Row: {
          id: string
          is_active: boolean | null
          title_id: string
          unlock_method: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          title_id: string
          unlock_method?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          title_id?: string
          unlock_method?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profile_titles_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_titles_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "profile_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quest_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          current_progress: number
          id: string
          last_updated: string
          quest_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          current_progress?: number
          id?: string
          last_updated?: string
          quest_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          current_progress?: number
          id?: string
          last_updated?: string
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "district_daily_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_progress: {
        Row: {
          concept_mastery: number | null
          consecutive_correct: number | null
          created_at: string
          difficulty_preference: number | null
          easiness_factor: number
          id: string
          interval_days: number
          last_response_time_ms: number | null
          last_reviewed: string | null
          learning_module_id: string | null
          learning_velocity: number | null
          next_review_date: string
          quality_responses: number[] | null
          question_id: string
          repetition_count: number
          srs_difficulty: number | null
          srs_retrievability: number | null
          srs_stability: number | null
          streak: number
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          concept_mastery?: number | null
          consecutive_correct?: number | null
          created_at?: string
          difficulty_preference?: number | null
          easiness_factor?: number
          id?: string
          interval_days?: number
          last_response_time_ms?: number | null
          last_reviewed?: string | null
          learning_module_id?: string | null
          learning_velocity?: number | null
          next_review_date?: string
          quality_responses?: number[] | null
          question_id: string
          repetition_count?: number
          srs_difficulty?: number | null
          srs_retrievability?: number | null
          srs_stability?: number | null
          streak?: number
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          concept_mastery?: number | null
          consecutive_correct?: number | null
          created_at?: string
          difficulty_preference?: number | null
          easiness_factor?: number
          id?: string
          interval_days?: number
          last_response_time_ms?: number | null
          last_reviewed?: string | null
          learning_module_id?: string | null
          learning_velocity?: number | null
          next_review_date?: string
          quality_responses?: number[] | null
          question_id?: string
          repetition_count?: number
          srs_difficulty?: number | null
          srs_retrievability?: number | null
          srs_stability?: number | null
          streak?: number
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_progress_learning_module_id_fkey"
            columns: ["learning_module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          claimed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          rewards_claimed: boolean | null
          status: string | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          rewards_claimed?: boolean | null
          status?: string | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          rewards_claimed?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      user_specializations: {
        Row: {
          id: string
          level: number
          specialization_type: string
          unlocked_at: string
          user_id: string
          xp: number
        }
        Insert: {
          id?: string
          level?: number
          specialization_type: string
          unlocked_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          id?: string
          level?: number
          specialization_type?: string
          unlocked_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_store_purchases: {
        Row: {
          amount_paid: number | null
          district_id: string
          id: string
          item_id: string
          purchase_type: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          district_id: string
          id?: string
          item_id: string
          purchase_type: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          district_id?: string
          id?: string
          item_id?: string
          purchase_type?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_store_purchases_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_store_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "district_store_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_store_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stories: {
        Row: {
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          media_url: string
          user_id: string
          views_count: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_url: string
          user_id: string
          views_count?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_url?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_stories_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teams: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_theme_progress: {
        Row: {
          created_at: string | null
          current_difficulty: string | null
          difficulty_progression: Json | null
          id: string
          last_session_at: string | null
          questions_answered: number | null
          questions_correct: number | null
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_difficulty?: string | null
          difficulty_progression?: Json | null
          id?: string
          last_session_at?: string | null
          questions_answered?: number | null
          questions_correct?: number | null
          theme: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_difficulty?: string | null
          difficulty_progression?: Json | null
          id?: string
          last_session_at?: string | null
          questions_answered?: number | null
          questions_correct?: number | null
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_titles: {
        Row: {
          description: string | null
          earned_at: string
          id: string
          is_active: boolean | null
          rarity: Database["public"]["Enums"]["powerup_rarity"] | null
          requirements_met: Json | null
          title: string
          user_id: string
        }
        Insert: {
          description?: string | null
          earned_at?: string
          id?: string
          is_active?: boolean | null
          rarity?: Database["public"]["Enums"]["powerup_rarity"] | null
          requirements_met?: Json | null
          title: string
          user_id: string
        }
        Update: {
          description?: string | null
          earned_at?: string
          id?: string
          is_active?: boolean | null
          rarity?: Database["public"]["Enums"]["powerup_rarity"] | null
          requirements_met?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_assets: {
        Row: {
          category: string | null
          created_at: string
          current_price: number
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          market_cap: number | null
          name: string
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          symbol: string
          updated_at: string
          volatility_level: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_price?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          symbol: string
          updated_at?: string
          volatility_level?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_price?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          symbol?: string
          updated_at?: string
          volatility_level?: number | null
        }
        Relationships: []
      }
      virtual_holdings: {
        Row: {
          asset_id: string
          avg_buy_price: number
          created_at: string
          current_value: number | null
          id: string
          portfolio_id: string
          profit_loss: number | null
          profit_loss_percentage: number | null
          quantity: number
          total_invested: number
          updated_at: string
        }
        Insert: {
          asset_id: string
          avg_buy_price?: number
          created_at?: string
          current_value?: number | null
          id?: string
          portfolio_id: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          total_invested?: number
          updated_at?: string
        }
        Update: {
          asset_id?: string
          avg_buy_price?: number
          created_at?: string
          current_value?: number | null
          id?: string
          portfolio_id?: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          total_invested?: number
          updated_at?: string
        }
        Relationships: []
      }
      virtual_market_events: {
        Row: {
          affected_assets: string[] | null
          created_at: string
          description: string | null
          duration_hours: number | null
          ends_at: string | null
          event_type: string | null
          id: string
          is_active: boolean | null
          price_impact_percentage: number | null
          starts_at: string
          title: string
        }
        Insert: {
          affected_assets?: string[] | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          price_impact_percentage?: number | null
          starts_at?: string
          title: string
        }
        Update: {
          affected_assets?: string[] | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          is_active?: boolean | null
          price_impact_percentage?: number | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      virtual_portfolios: {
        Row: {
          best_trade_profit: number | null
          created_at: string
          current_balance: number | null
          id: string
          initial_balance: number | null
          losing_trades: number | null
          name: string
          portfolio_value: number | null
          profit_loss: number | null
          profit_loss_percentage: number | null
          total_invested: number | null
          trades_count: number | null
          updated_at: string
          user_id: string
          winning_trades: number | null
          worst_trade_loss: number | null
        }
        Insert: {
          best_trade_profit?: number | null
          created_at?: string
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          losing_trades?: number | null
          name?: string
          portfolio_value?: number | null
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          total_invested?: number | null
          trades_count?: number | null
          updated_at?: string
          user_id: string
          winning_trades?: number | null
          worst_trade_loss?: number | null
        }
        Update: {
          best_trade_profit?: number | null
          created_at?: string
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          losing_trades?: number | null
          name?: string
          portfolio_value?: number | null
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          total_invested?: number | null
          trades_count?: number | null
          updated_at?: string
          user_id?: string
          winning_trades?: number | null
          worst_trade_loss?: number | null
        }
        Relationships: []
      }
      virtual_trades: {
        Row: {
          asset_id: string
          executed_at: string
          fees: number | null
          id: string
          notes: string | null
          portfolio_id: string
          price: number
          profit_loss: number | null
          quantity: number
          total_amount: number
          trade_type: string
        }
        Insert: {
          asset_id: string
          executed_at?: string
          fees?: number | null
          id?: string
          notes?: string | null
          portfolio_id: string
          price: number
          profit_loss?: number | null
          quantity: number
          total_amount: number
          trade_type: string
        }
        Update: {
          asset_id?: string
          executed_at?: string
          fees?: number | null
          id?: string
          notes?: string | null
          portfolio_id?: string
          price?: number
          profit_loss?: number | null
          quantity?: number
          total_amount?: number
          trade_type?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_leaderboards: {
        Row: {
          created_at: string
          duels_won: number
          id: string
          league_id: string | null
          quiz_score: number
          rank_position: number | null
          rewards_claimed: boolean
          streak_days: number
          total_score: number
          updated_at: string
          user_id: string
          week_start_date: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          duels_won?: number
          id?: string
          league_id?: string | null
          quiz_score?: number
          rank_position?: number | null
          rewards_claimed?: boolean
          streak_days?: number
          total_score?: number
          updated_at?: string
          user_id: string
          week_start_date: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          duels_won?: number
          id?: string
          league_id?: string | null
          quiz_score?: number
          rank_position?: number | null
          rewards_claimed?: boolean
          streak_days?: number
          total_score?: number
          updated_at?: string
          user_id?: string
          week_start_date?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_weekly_leaderboards_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_leaderboards_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_data: {
        Row: {
          avatar_url: string | null
          level: number | null
          nickname: string | null
          points: number | null
          rank: number | null
          xp: number | null
        }
        Relationships: []
      }
      public_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string | null
          created_at: string | null
          id: string | null
          user_avatar: string | null
          user_level: number | null
          user_nickname: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_to_smart_queue: {
        Args: { p_invite_id: string }
        Returns: string
      }
      apply_btz_penalty: {
        Args: { profile_id: string }
        Returns: {
          penalty_applied: boolean
          penalty_amount: number
          days_inactive: number
        }[]
      }
      assign_bot_achievements: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      auto_accept_bot_duels: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      award_daily_loot_box: {
        Args: { profile_id: string }
        Returns: string
      }
      award_duel_prize: {
        Args: { duel_id: string; winner_id: string; prize_amount: number }
        Returns: boolean
      }
      award_xp: {
        Args: { profile_id: string; xp_amount: number; source?: string }
        Returns: undefined
      }
      calculate_correct_level: {
        Args: { user_xp: number }
        Returns: number
      }
      calculate_daily_yield: {
        Args: { profile_id: string }
        Returns: {
          yield_amount: number
          new_total: number
          applied_rate: number
          streak_bonus: number
          subscription_bonus: number
        }[]
      }
      calculate_invite_priority: {
        Args: {
          p_challenger_id: string
          p_challenged_id: string
          p_quiz_topic: string
        }
        Returns: number
      }
      calculate_league_points: {
        Args: {
          p_user_id: string
          p_xp_gained: number
          p_quiz_score: number
          p_combo_achieved?: number
        }
        Returns: number
      }
      calculate_question_similarity: {
        Args: { text1: string; text2: string }
        Returns: number
      }
      calculate_user_level: {
        Args: { user_xp: number }
        Returns: number
      }
      check_duel_limit: {
        Args: { profile_id: string }
        Returns: boolean
      }
      check_user_is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_user_team_membership: {
        Args: { p_user_id: string; p_district_id: string }
        Returns: boolean
      }
      clean_duplicate_questions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      clean_expired_btc_queue: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      clean_expired_casino_queue: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_inactive_presence: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_inactive_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      complete_btc_duel: {
        Args: { p_duel_id: string; p_final_price: number }
        Returns: {
          winner_profile_id: string
          prize_amount: number
        }[]
      }
      complete_duel_participation: {
        Args: {
          p_duel_id: string
          p_user_id: string
          p_answers: Json
          p_participation_time_seconds: number
        }
        Returns: number
      }
      create_affiliate_program: {
        Args: { p_user_id: string }
        Returns: string
      }
      create_crisis_event: {
        Args: {
          p_title: string
          p_description: string
          p_crisis_type?: string
          p_btz_goal?: number
          p_xp_goal?: number
          p_duration_hours?: number
        }
        Returns: string
      }
      create_duel_with_invite: {
        Args:
          | {
              p_challenger_id: string
              p_challenged_id: string
              p_bet_amount: number
              p_topic: string
            }
          | { p_invite_id: string; p_challenger_id: string }
        Returns: Json
      }
      daitch_mokotoff: {
        Args: { "": string }
        Returns: string[]
      }
      determine_duel_winner: {
        Args: {
          p_duel_id: string
          p_player1_answers: Json
          p_player2_answers: Json
          p_player1_time: number
          p_player2_time: number
        }
        Returns: {
          winner_id: string
          player1_score: number
          player2_score: number
          tie_broken_by: string
        }[]
      }
      dmetaphone: {
        Args: { "": string }
        Returns: string
      }
      dmetaphone_alt: {
        Args: { "": string }
        Returns: string
      }
      enhance_bot_realism: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enhance_bot_realism_batch: {
        Args: { batch_size?: number; offset_value?: number }
        Returns: {
          processed: number
          total_bots: number
          has_more: boolean
          success: boolean
          error_message: string
        }[]
      }
      fill_missing_bot_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      finalize_expired_emergencies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_automatic_opponent: {
        Args:
          | { p_user_id: string; p_topic?: string }
          | {
              user_id_param: string
              topic_param?: string
              max_level_diff?: number
            }
          | { user_profile_id: string }
        Returns: string
      }
      find_btc_duel_opponent: {
        Args: { p_user_id: string; p_bet_amount: number }
        Returns: {
          opponent_id: string
          queue_id: string
          is_bot: boolean
        }[]
      }
      find_similar_questions: {
        Args: { new_question: string; similarity_threshold?: number }
        Returns: {
          id: string
          question: string
          similarity: number
        }[]
      }
      generate_ai_recommendations: {
        Args: { p_user_id: string }
        Returns: Json
      }
      generate_bot_profile: {
        Args: { bot_count?: number }
        Returns: {
          bot_id: string
          nickname: string
          level: number
          xp: number
          points: number
        }[]
      }
      generate_daily_challenges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_daily_missions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_question_template: {
        Args: Record<PropertyKey, never>
        Returns: {
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          explanation: string
          category: string
          difficulty: string
          difficulty_level: number
          district_id: string
          learning_module_id: string
          tags: string
          learning_objectives: string
          estimated_time_seconds: number
          question_type: string
          cognitive_level: string
          concepts: string
          source_material: string
        }[]
      }
      get_admin_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_anonymized_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_online_users: number
          total_active_users: number
        }[]
      }
      get_arena_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          nickname: string
          level: number
          avatar_id: string
          is_bot: boolean
          is_online: boolean
          profile_image_url: string
        }[]
      }
      get_btc_queue_stats: {
        Args: { p_bet_amount: number }
        Returns: {
          queue_count: number
          estimated_wait_time: number
          active_duels: number
        }[]
      }
      get_current_season: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_data_optimized: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_dashboard_super_optimized: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_duel_status: {
        Args: { p_duel_id: string }
        Returns: Json
      }
      get_next_level_xp: {
        Args: { current_level: number }
        Returns: number
      }
      get_or_create_weekly_entry: {
        Args: { profile_id: string }
        Returns: string
      }
      get_profile_with_avatar: {
        Args: { profile_id: string }
        Returns: {
          id: string
          nickname: string
          level: number
          xp: number
          points: number
          profile_image_url: string
          avatar_name: string
          avatar_image_url: string
          is_bot: boolean
        }[]
      }
      get_public_profile_data: {
        Args: { profile_ids: string[] }
        Returns: {
          id: string
          nickname: string
          level: number
          xp: number
          current_avatar_id: string
          subscription_tier: string
          created_at: string
        }[]
      }
      get_safe_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          nickname: string
          level: number
          xp: number
          rank_position: number
        }[]
      }
      get_user_evolution_data: {
        Args:
          | { user_id_param: string; start_date: string; end_date: string }
          | { user_id_param: string; start_date: string; end_date: string }
        Returns: {
          date: string
          xp: number
          level: number
          btz: number
          streak: number
          quizzes_completed: number
        }[]
      }
      get_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          nickname: string
          level: number
          xp: number
          points: number
          streak: number
          consecutive_login_days: number
          last_login_date: string
          current_avatar_id: string
          profile_image_url: string
          subscription_tier: string
          created_at: string
          updated_at: string
          is_bot: boolean
        }[]
      }
      get_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_xp_multiplier: {
        Args: { profile_id: string }
        Returns: number
      }
      improve_bot_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      increment_duel_count: {
        Args: { profile_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_following_user: {
        Args: { target_profile_id: string }
        Returns: boolean
      }
      is_guild_leader_or_officer: {
        Args: { p_user_id: string; p_guild_id: string }
        Returns: boolean
      }
      is_guild_member: {
        Args: { p_user_id: string; p_guild_id: string }
        Returns: boolean
      }
      is_master_admin: {
        Args: { email_check: string }
        Returns: boolean
      }
      is_profile_owner: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      is_user_available_for_duel: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { event_type: string; user_id?: string; event_data?: Json }
        Returns: undefined
      }
      mark_daily_login_safe: {
        Args: { profile_id: string }
        Returns: boolean
      }
      mark_user_offline: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      monitor_yield_anomalies: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_id: string
          yield_amount: number
          issue_type: string
        }[]
      }
      open_loot_box: {
        Args: { profile_id: string; user_loot_box_id: string }
        Returns: {
          items: Json
        }[]
      }
      process_duel_answer: {
        Args: {
          p_duel_id: string
          p_player_id: string
          p_question_number: number
          p_answer_id: string
          p_is_timeout?: boolean
        }
        Returns: Json
      }
      process_guild_request: {
        Args: {
          p_request_id: string
          p_reviewer_id: string
          p_approved: boolean
        }
        Returns: boolean
      }
      process_virtual_purchase: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_transaction_id: string
        }
        Returns: Json
      }
      request_guild_membership: {
        Args: { p_guild_id: string; p_user_id: string; p_message?: string }
        Returns: boolean
      }
      simulate_bot_presence: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      soundex: {
        Args: { "": string }
        Returns: string
      }
      start_district_duel: {
        Args: {
          p_initiator_district_id: string
          p_challenged_district_id: string
        }
        Returns: string
      }
      text_soundex: {
        Args: { "": string }
        Returns: string
      }
      track_district_metric: {
        Args: {
          p_district_id: string
          p_metric_type: string
          p_metric_value: number
          p_metric_data?: Json
        }
        Returns: undefined
      }
      transfer_btz: {
        Args: { sender_id: string; receiver_id: string; amount: number }
        Returns: Json
      }
      update_bot_nicknames: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_challenge_progress: {
        Args: {
          profile_id: string
          challenge_type_param: string
          progress_amount?: number
        }
        Returns: {
          challenge_completed: boolean
          rewards_earned: Json
        }[]
      }
      update_duel_statistics: {
        Args: { p_duel_id: string }
        Returns: undefined
      }
      update_learning_analytics: {
        Args: {
          p_user_id: string
          p_study_time: number
          p_questions_attempted: number
          p_questions_correct: number
        }
        Returns: Json
      }
      update_learning_streak: {
        Args: { p_user_id: string; p_module_id?: string }
        Returns: Json
      }
      update_lesson_streak: {
        Args: { p_user_id: string; p_lesson_date: string }
        Returns: Json
      }
      update_login_streak: {
        Args: { profile_id: string }
        Returns: {
          streak_updated: boolean
          new_streak: number
          yield_bonus: number
        }[]
      }
      update_mission_progress: {
        Args: {
          profile_id: string
          mission_type_param: string
          progress_amount?: number
        }
        Returns: {
          mission_completed: boolean
          rewards_earned: Json
        }[]
      }
      update_module_progress: {
        Args: {
          p_user_id: string
          p_module_id: string
          p_lesson_completed?: boolean
        }
        Returns: undefined
      }
      update_srs_with_concepts: {
        Args: {
          p_user_id: string
          p_question_id: string
          p_is_correct: boolean
          p_response_time_ms?: number
        }
        Returns: Json
      }
      update_user_heartbeat: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      update_user_league: {
        Args: { p_user_id: string; p_points_gained: number }
        Returns: Json
      }
      update_user_streak: {
        Args: { profile_id: string; activity_date?: string }
        Returns: number
      }
      update_weekly_leaderboard: {
        Args: {
          profile_id: string
          xp_gained?: number
          quiz_points?: number
          duel_win?: boolean
        }
        Returns: undefined
      }
      validate_admin_token: {
        Args: { token_value: string; operation_type?: string }
        Returns: Json
      }
      validate_data_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          issue_count: number
          issue_description: string
        }[]
      }
      verify_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator"
      approval_status_type: "pending" | "approved" | "rejected"
      combo_type:
        | "perfect_streak"
        | "speed_demon"
        | "knowledge_master"
        | "quiz_dominator"
      currency_type: "BRL" | "USD" | "EUR" | "BTZ"
      customization_type:
        | "avatar_skin"
        | "profile_theme"
        | "ui_effect"
        | "sound_pack"
        | "emote"
      event_status: "upcoming" | "active" | "completed" | "cancelled"
      event_type:
        | "quiz_marathon"
        | "duel_tournament"
        | "knowledge_race"
        | "community_challenge"
      league_tier:
        | "bronze"
        | "silver"
        | "gold"
        | "platinum"
        | "diamond"
        | "master"
        | "grandmaster"
      mentorship_status: "pending" | "active" | "completed" | "cancelled"
      powerup_category:
        | "xp_boost"
        | "score_multiplier"
        | "time_extension"
        | "hint_reveal"
        | "streak_protection"
      powerup_rarity: "common" | "rare" | "epic" | "legendary"
      product_type:
        | "premium_subscription"
        | "beetz_pack"
        | "avatar"
        | "powerup"
        | "loot_box"
        | "course_access"
      quiz_difficulty: "EASY" | "MEDIUM" | "HARD" | "INSANE"
      quiz_topic: "DIA_A_DIA" | "ABC" | "CRIPTO"
      season_status: "upcoming" | "active" | "ended"
      subscription_tier: "free" | "pro" | "elite"
      transaction_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
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
      admin_role: ["super_admin", "admin", "moderator"],
      approval_status_type: ["pending", "approved", "rejected"],
      combo_type: [
        "perfect_streak",
        "speed_demon",
        "knowledge_master",
        "quiz_dominator",
      ],
      currency_type: ["BRL", "USD", "EUR", "BTZ"],
      customization_type: [
        "avatar_skin",
        "profile_theme",
        "ui_effect",
        "sound_pack",
        "emote",
      ],
      event_status: ["upcoming", "active", "completed", "cancelled"],
      event_type: [
        "quiz_marathon",
        "duel_tournament",
        "knowledge_race",
        "community_challenge",
      ],
      league_tier: [
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "master",
        "grandmaster",
      ],
      mentorship_status: ["pending", "active", "completed", "cancelled"],
      powerup_category: [
        "xp_boost",
        "score_multiplier",
        "time_extension",
        "hint_reveal",
        "streak_protection",
      ],
      powerup_rarity: ["common", "rare", "epic", "legendary"],
      product_type: [
        "premium_subscription",
        "beetz_pack",
        "avatar",
        "powerup",
        "loot_box",
        "course_access",
      ],
      quiz_difficulty: ["EASY", "MEDIUM", "HARD", "INSANE"],
      quiz_topic: ["DIA_A_DIA", "ABC", "CRIPTO"],
      season_status: ["upcoming", "active", "ended"],
      subscription_tier: ["free", "pro", "elite"],
      transaction_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
    },
  },
} as const
