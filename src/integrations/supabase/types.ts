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
      avatars: {
        Row: {
          avatar_class: string | null
          backstory: string | null
          bonus_effects: Json | null
          created_at: string
          description: string | null
          district_theme: string | null
          evolution_level: number | null
          id: string
          image_url: string
          is_available: boolean
          is_starter: boolean | null
          level_required: number
          model_url: string | null
          name: string
          price: number
          rarity: string
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
          id?: string
          image_url: string
          is_available?: boolean
          is_starter?: boolean | null
          level_required?: number
          model_url?: string | null
          name: string
          price?: number
          rarity?: string
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
          id?: string
          image_url?: string
          is_available?: boolean
          is_starter?: boolean | null
          level_required?: number
          model_url?: string | null
          name?: string
          price?: number
          rarity?: string
          updated_at?: string
        }
        Relationships: []
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
      districts: {
        Row: {
          color_primary: string
          color_secondary: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          level_required: number
          name: string
          theme: string
          updated_at: string
        }
        Insert: {
          color_primary: string
          color_secondary: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level_required?: number
          name: string
          theme: string
          updated_at?: string
        }
        Update: {
          color_primary?: string
          color_secondary?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level_required?: number
          name?: string
          theme?: string
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
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
          daily_duels_reset_date: string | null
          daily_duels_used: number | null
          id: string
          level: number | null
          nickname: string
          points: number
          profile_image_url: string | null
          streak: number | null
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          avatar_id?: string | null
          completed_lessons?: number | null
          created_at?: string
          daily_duels_reset_date?: string | null
          daily_duels_used?: number | null
          id?: string
          level?: number | null
          nickname: string
          points?: number
          profile_image_url?: string | null
          streak?: number | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id: string
          xp?: number | null
        }
        Update: {
          avatar_id?: string | null
          completed_lessons?: number | null
          created_at?: string
          daily_duels_reset_date?: string | null
          daily_duels_used?: number | null
          id?: string
          level?: number | null
          nickname?: string
          points?: number
          profile_image_url?: string | null
          streak?: number | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
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
      quiz_questions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          difficulty: string
          district_id: string | null
          explanation: string | null
          id: string
          options: Json
          question: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          correct_answer: string
          created_at?: string
          difficulty: string
          district_id?: string | null
          explanation?: string | null
          id?: string
          options: Json
          question: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          difficulty?: string
          district_id?: string | null
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
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
          current_progress: number
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
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
          residence_started_at: string | null
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
          residence_started_at?: string | null
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
          residence_started_at?: string | null
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
          id: string
          is_online: boolean
          last_seen: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          last_seen?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
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
          created_at: string
          easiness_factor: number
          id: string
          interval_days: number
          last_reviewed: string | null
          next_review_date: string
          quality_responses: number[] | null
          question_id: string
          repetition_count: number
          streak: number
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          easiness_factor?: number
          id?: string
          interval_days?: number
          last_reviewed?: string | null
          next_review_date?: string
          quality_responses?: number[] | null
          question_id: string
          repetition_count?: number
          streak?: number
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          easiness_factor?: number
          id?: string
          interval_days?: number
          last_reviewed?: string | null
          next_review_date?: string
          quality_responses?: number[] | null
          question_id?: string
          repetition_count?: number
          streak?: number
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "weekly_leaderboards_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: { profile_id: string; xp_amount: number; activity_type?: string }
        Returns: {
          new_xp: number
          new_level: number
          level_up: boolean
          rewards: Json
        }[]
      }
      calculate_user_level: {
        Args: { user_xp: number }
        Returns: number
      }
      check_duel_limit: {
        Args: { profile_id: string }
        Returns: boolean
      }
      generate_daily_missions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_next_level_xp: {
        Args: { current_level: number }
        Returns: number
      }
      get_xp_multiplier: {
        Args: { profile_id: string }
        Returns: number
      }
      increment_duel_count: {
        Args: { profile_id: string }
        Returns: undefined
      }
      log_security_event: {
        Args: { event_type: string; user_id: string; event_data?: Json }
        Returns: undefined
      }
      update_user_streak: {
        Args: { profile_id: string; activity_date?: string }
        Returns: number
      }
    }
    Enums: {
      subscription_tier: "free" | "pro" | "elite"
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
      subscription_tier: ["free", "pro", "elite"],
    },
  },
} as const
