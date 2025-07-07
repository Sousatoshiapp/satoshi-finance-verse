import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) throw new Error("Missing stripe-signature header");

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          await handleSubscriptionCreated(supabaseClient, session);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabaseClient, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabaseClient, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handlePaymentSucceeded(supabaseClient, invoice);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handlePaymentFailed(supabaseClient, invoice);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in subscription-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

async function handleSubscriptionCreated(supabaseClient: any, session: Stripe.Checkout.Session) {
  logStep("Handling subscription created", { sessionId: session.id });
  
  const { user_id, profile_id, tier } = session.metadata || {};
  
  if (!user_id || !profile_id || !tier) {
    throw new Error("Missing required metadata in session");
  }

  // Update profile subscription tier
  await supabaseClient
    .from('profiles')
    .update({ 
      subscription_tier: tier,
      subscription_expires_at: null // Active subscription
    })
    .eq('id', profile_id);

  // Create subscription record
  await supabaseClient
    .from('subscriptions')
    .upsert({
      user_id: profile_id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      subscription_tier: tier,
      status: 'active',
      current_period_start: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  logStep("Subscription created successfully", { userId: user_id, tier });
}

async function handleSubscriptionUpdated(supabaseClient: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription updated", { subscriptionId: subscription.id });

  const { user_id, profile_id, tier } = subscription.metadata || {};
  
  if (!profile_id) {
    logStep("No profile_id in subscription metadata");
    return;
  }

  // Update subscription status
  await supabaseClient
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update profile if subscription is active
  if (subscription.status === 'active' && tier) {
    await supabaseClient
      .from('profiles')
      .update({ 
        subscription_tier: tier,
        subscription_expires_at: null
      })
      .eq('id', profile_id);
  }

  logStep("Subscription updated successfully");
}

async function handleSubscriptionCanceled(supabaseClient: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription canceled", { subscriptionId: subscription.id });

  const { profile_id } = subscription.metadata || {};
  
  if (!profile_id) {
    logStep("No profile_id in subscription metadata");
    return;
  }

  // Update subscription status
  await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free tier
  await supabaseClient
    .from('profiles')
    .update({ 
      subscription_tier: 'free',
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('id', profile_id);

  logStep("Subscription canceled successfully");
}

async function handlePaymentSucceeded(supabaseClient: any, invoice: Stripe.Invoice) {
  logStep("Handling payment succeeded", { invoiceId: invoice.id });

  // Award monthly Beetz based on subscription tier
  const { data: subscription } = await supabaseClient
    .from('subscriptions')
    .select('user_id, subscription_tier')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (subscription) {
    const beetzAmount = subscription.subscription_tier === 'pro' ? 50 : 
                       subscription.subscription_tier === 'elite' ? 100 : 0;
    
    if (beetzAmount > 0) {
      await supabaseClient
        .from('profiles')
        .update({ 
          points: supabaseClient.sql`points + ${beetzAmount}`
        })
        .eq('id', subscription.user_id);

      logStep("Monthly Beetz awarded", { userId: subscription.user_id, amount: beetzAmount });
    }
  }
}

async function handlePaymentFailed(supabaseClient: any, invoice: Stripe.Invoice) {
  logStep("Handling payment failed", { invoiceId: invoice.id });
  
  // Could implement grace period logic here
  // For now, just log the event
  logStep("Payment failed - manual intervention may be required");
}