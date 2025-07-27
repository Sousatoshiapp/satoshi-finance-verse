import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userIds, notificationData, notificationType } = await req.json();

    if (!userIds || !Array.isArray(userIds) || !notificationData) {
      throw new Error('userIds (array) e notificationData são obrigatórios');
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'mailto:admin@satoshifinance.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys não configuradas');
    }

    // Get push subscriptions for users
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_notification_settings')
      .select('*')
      .in('user_id', userIds)
      .eq('is_enabled', true)
      .not('endpoint', 'is', null);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      console.log('Nenhuma subscription ativa encontrada');
      return new Response(
        JSON.stringify({ sent: 0, errors: ['Nenhuma subscription ativa'] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Send notifications
    for (const subscription of subscriptions) {
      try {
        // Check notification type preferences
        const notificationTypes = subscription.notification_types as any;
        if (notificationType && notificationTypes && !notificationTypes[notificationType]) {
          console.log(`User ${subscription.user_id} disabled ${notificationType} notifications`);
          continue;
        }

        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key,
          },
        };

        // Create the push message
        const payload = JSON.stringify({
          title: notificationData.title,
          body: notificationData.body,
          icon: notificationData.icon || '/favicon.ico',
          badge: notificationData.badge || '/favicon.ico',
          image: notificationData.image,
          tag: notificationData.tag || 'satoshi-finance',
          requireInteraction: notificationData.requireInteraction || false,
          silent: notificationData.silent || false,
          vibrate: notificationData.vibrate || [200, 100, 200],
          data: {
            ...notificationData.data,
            type: notificationType,
            timestamp: Date.now(),
          },
          actions: notificationData.actions || [],
        });

        // Send push notification using Web Push Protocol
        const response = await sendWebPush(
          pushSubscription,
          payload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidEmail
        );

        if (response.ok) {
          sentCount++;
          
          // Log successful notification
          await supabaseClient
            .from('push_notification_logs')
            .insert({
              user_id: subscription.user_id,
              notification_type: notificationType || 'general',
              title: notificationData.title,
              body: notificationData.body,
              data: notificationData.data || {},
              status: 'sent',
              sent_at: new Date().toISOString(),
            });
            
        } else {
          const errorText = await response.text();
          errors.push(`User ${subscription.user_id}: ${response.status} ${errorText}`);
          
          // Log failed notification
          await supabaseClient
            .from('push_notification_logs')
            .insert({
              user_id: subscription.user_id,
              notification_type: notificationType || 'general',
              title: notificationData.title,
              body: notificationData.body,
              data: notificationData.data || {},
              status: 'failed',
              error_message: `${response.status} ${errorText}`,
            });

          // If subscription is invalid, disable it
          if (response.status === 410 || response.status === 404) {
            await supabaseClient
              .from('push_notification_settings')
              .update({ is_enabled: false })
              .eq('id', subscription.id);
          }
        }
      } catch (error: any) {
        console.error(`Error sending to user ${subscription.user_id}:`, error);
        errors.push(`User ${subscription.user_id}: ${error.message}`);
        
        // Log error
        await supabaseClient
          .from('push_notification_logs')
          .insert({
            user_id: subscription.user_id,
            notification_type: notificationType || 'general',
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data || {},
            status: 'failed',
            error_message: error.message,
          });
      }
    }

    return new Response(
      JSON.stringify({
        sent: sentCount,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Web Push implementation
async function sendWebPush(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidEmail: string
): Promise<Response> {
  const url = new URL(subscription.endpoint);
  
  // Create JWT for VAPID
  const vapidHeaders = await createVAPIDHeaders(
    subscription.endpoint,
    vapidPublicKey,
    vapidPrivateKey,
    vapidEmail
  );

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': 'aes128gcm',
    'TTL': '86400', // 24 hours
    ...vapidHeaders,
  };

  // For now, send unencrypted (this should be encrypted in production)
  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: payload,
  });
}

// Simplified VAPID headers (should use proper JWT library in production)
async function createVAPIDHeaders(
  endpoint: string,
  publicKey: string,
  privateKey: string,
  email: string
): Promise<Record<string, string>> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  // This is a simplified version - in production, use proper JWT signing
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: email,
  };

  // For now, return basic headers (implement proper JWT signing in production)
  return {
    'Authorization': `vapid t=${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.signature, k=${publicKey}`,
  };
}