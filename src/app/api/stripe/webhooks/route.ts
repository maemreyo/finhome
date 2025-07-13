// Stripe Webhook Handler

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import {
  verifyStripeWebhook,
  getPlanByStripePriceId,
} from "@/lib/stripe/config";
import {
  sendSubscriptionConfirmation,
  sendPaymentFailedNotification,
} from "@/lib/email/resend";
import Stripe from "stripe";
import { Database } from '@/lib/supabase/types'

interface CustomStripeInvoice extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription | null;
  payment_intent: string | Stripe.PaymentIntent | null;
}

interface CustomStripeSubscription extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyStripeWebhook(body, signature);
    const supabase = createAdminClient();

    console.log("Stripe webhook event:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as CustomStripeSubscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as CustomStripeSubscription;
        await handleSubscriptionCancellation(supabase, subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as CustomStripeInvoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

// Helper functions for webhook handlers
async function handleSubscriptionUpdate(
  supabase: any,
  subscription: CustomStripeSubscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  // Get the plan info
  const plan = getPlanByStripePriceId(priceId);

  // Find user by customer ID
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!existingSubscription) {
    console.error("No user found for customer:", customerId);
    return;
  }

  // Update subscription in database
  const { error } = await supabase
    .from("subscriptions")
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status: status as Database["public"]["Enums"]["subscription_status"],
      plan_name: plan?.name || "Unknown",
      current_period_start: subscription.current_period_start as number,
      current_period_end: subscription.current_period_end as number,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start || null,
      trial_end: subscription.trial_end || null,
    })
    .eq("user_id", existingSubscription.user_id);

  if (error) {
    console.error("Error updating subscription:", error);
    return;
  }

  // Send confirmation email for new active subscriptions
  if (status === "active" && plan) {
    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", existingSubscription.user_id)
      .single();

    if (profile?.email) {
      try {
        await sendSubscriptionConfirmation(
          profile.email,
          plan.name,
          subscription.items.data[0]?.price.unit_amount || 0
        );
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
    }
  }
}

async function handleSubscriptionCancellation(
  supabase: any,
  subscription: CustomStripeSubscription
) {
  const subscriptionId = subscription.id;

  // Update subscription status
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: true,
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Error updating canceled subscription:", error);
  }
}

async function handleInvoicePaid(supabase: any, invoice: CustomStripeInvoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription ? (typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id) : null;

  // Find user by customer ID
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!subscription) {
    console.error("No user found for customer:", customerId);
    return;
  }

  // Store billing history
  const { error } = await supabase.from("billing_history").insert({
    user_id: subscription.user_id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id:
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent?.id,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status,
    invoice_url: invoice.hosted_invoice_url,
    invoice_pdf: invoice.invoice_pdf,
    billing_reason: invoice.billing_reason,
  });

  if (error) {
    console.error("Error storing billing history:", error);
  }
}

async function handleInvoicePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  // Find user by customer ID
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id, plan_name")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!subscription) {
    console.error("No user found for customer:", customerId);
    return;
  }

  // Get user email and send notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", subscription.user_id)
    .single();

  if (profile?.email) {
    try {
      await sendPaymentFailedNotification(
        profile.email,
        subscription.plan_name || "Pro"
      );
    } catch (emailError) {
      console.error("Error sending payment failed email:", emailError);
    }
  }

  // Update subscription status if needed
  if (invoice.attempt_count >= 3) {
    await supabase
      .from("subscriptions")
      .update({
        status:
          "past_due" as Database["public"]["Enums"]["subscription_status"],
      })
      .eq("stripe_customer_id", customerId);
  }
}
