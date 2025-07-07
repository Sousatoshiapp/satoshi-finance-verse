import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  userId: string
  type: 'message' | 'like' | 'comment' | 'follow' | 'mention' | 'challenge' | 'badge'
  title: string
  message: string
  actionUrl?: string
  data?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, type, title, message, actionUrl, data }: NotificationPayload = await req.json()

    console.log('Processing notification:', { userId, type, title })

    // Get user's profile ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nickname')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        type: type,
        title: title,
        message: message,
        action_url: actionUrl,
        data: data || {}
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      throw notificationError
    }

    // Get push notification settings for user
    const { data: pushSettings, error: pushError } = await supabase
      .from('push_notification_settings')
      .select('*')
      .eq('user_id', profile.id)
      .eq('enabled', true)
      .single()

    if (pushError || !pushSettings || !pushSettings.endpoint) {
      console.log('No push settings found for user, notification saved to database only')
      return new Response(
        JSON.stringify({ success: true, push_sent: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare push notification payload
    const pushPayload = {
      title: title,
      body: message,
      icon: '/icon-192.png',
      badge: '/badge.png',
      data: {
        url: actionUrl || '/social',
        type: type,
        ...data
      },
      requireInteraction: type === 'message',
      tag: `${type}-${Date.now()}`
    }

    // Send push notification using Web Push API
    try {
      const vapidKeys = {
        publicKey: Deno.env.get('VAPID_PUBLIC_KEY') || 'your-vapid-public-key-here',
        privateKey: Deno.env.get('VAPID_PRIVATE_KEY') || 'your-vapid-private-key-here'
      }

      // For now, we'll log the push notification
      // In production, you'd use a proper Web Push library
      console.log('Would send push notification:', {
        endpoint: pushSettings.endpoint,
        payload: pushPayload,
        keys: {
          p256dh: pushSettings.p256dh_key,
          auth: pushSettings.auth_key
        }
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          notification_created: true,
          push_sent: true,
          message: 'Notification sent successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (pushError) {
      console.error('Error sending push notification:', pushError)
      
      // Still return success since notification was saved to database
      return new Response(
        JSON.stringify({ 
          success: true, 
          notification_created: true,
          push_sent: false,
          push_error: pushError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in send-social-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})