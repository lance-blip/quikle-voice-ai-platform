/**
 * Stripe Payment Integration
 * Handles payment processing, subscriptions, and invoicing
 */

export interface StripeConfig {
  apiKey: string;
  webhookSecret?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  customerId?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  customerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  items: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  priceId: string;
  quantity: number;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export class StripeIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(config: StripeConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent> {
    const response = await fetch(`${this.baseUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: params.amount.toString(),
        currency: params.currency,
        ...(params.customerId && { customer: params.customerId }),
        ...(params.metadata && { 'metadata[key]': JSON.stringify(params.metadata) }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      customerId: data.customer,
      metadata: data.metadata,
      createdAt: new Date(data.created * 1000),
    };
  }

  /**
   * Create a customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: params.email,
        ...(params.name && { name: params.name }),
        ...(params.phone && { phone: params.phone }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    };
  }

  /**
   * Create a subscription
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    quantity?: number;
    trialPeriodDays?: number;
  }): Promise<Subscription> {
    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: params.customerId,
        'items[0][price]': params.priceId,
        'items[0][quantity]': (params.quantity || 1).toString(),
        ...(params.trialPeriodDays && { trial_period_days: params.trialPeriodDays.toString() }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      customerId: data.customer,
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start * 1000),
      currentPeriodEnd: new Date(data.current_period_end * 1000),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      items: data.items.data.map((item: any) => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity,
      })),
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Subscription> {
    const endpoint = cancelAtPeriodEnd 
      ? `${this.baseUrl}/subscriptions/${subscriptionId}`
      : `${this.baseUrl}/subscriptions/${subscriptionId}`;

    const response = await fetch(endpoint, {
      method: cancelAtPeriodEnd ? 'POST' : 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(cancelAtPeriodEnd && {
        body: new URLSearchParams({
          cancel_at_period_end: 'true',
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      customerId: data.customer,
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start * 1000),
      currentPeriodEnd: new Date(data.current_period_end * 1000),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      items: data.items.data.map((item: any) => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity,
      })),
    };
  }

  /**
   * Retrieve a customer
   */
  async getCustomer(customerId: string): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // In production, use Stripe's webhook signature verification
    // This is a placeholder implementation
    return true;
  }
}

