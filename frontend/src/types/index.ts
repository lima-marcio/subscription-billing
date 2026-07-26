export type BillingCycle = 'Monthly' | 'Annual';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  priceCurrency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  isArchived: boolean;
  createdAt: string;
}

export interface CreatePlanRequest {
  name: string;
  description: string | null;
  priceAmount: number;
  priceCurrency: string;
  billingCycle: BillingCycle;
  trialDays: number;
}

export type UpdatePlanRequest = CreatePlanRequest;

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateSubscriberRequest {
  name: string;
  email: string;
}

export type UpdateSubscriberRequest = CreateSubscriberRequest;

export type SubscriptionStatus =
  | 'Trialing'
  | 'Active'
  | 'PastDue'
  | 'Suspended'
  | 'Cancelled'
  | 'Expired';

export interface Subscription {
  id: string;
  subscriberId: string;
  subscriberName: string;
  subscriberEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startedAt: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string;
  nextChargeAt: string;
  cancelledAt: string | null;
  pendingPlanId: string | null;
  pendingPlanName: string | null;
}

export interface CreateSubscriptionRequest {
  subscriberId: string;
  planId: string;
}

export interface SchedulePlanChangeRequest {
  newPlanId: string;
}
