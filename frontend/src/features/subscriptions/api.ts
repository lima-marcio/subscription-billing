import { apiClient } from '../../api/client';
import type { CreateSubscriptionRequest, SchedulePlanChangeRequest, Subscription } from '../../types';

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data } = await apiClient.get<Subscription[]>('/subscriptions');
  return data;
}

export async function getSubscription(id: string): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>(`/subscriptions/${id}`);
  return data;
}

export async function createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>('/subscriptions', request);
  return data;
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>(`/subscriptions/${id}/cancel`);
  return data;
}

export async function reactivateSubscription(id: string): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>(`/subscriptions/${id}/reactivate`);
  return data;
}

export async function schedulePlanChange(
  id: string,
  request: SchedulePlanChangeRequest,
): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>(`/subscriptions/${id}/plan-change`, request);
  return data;
}
