import { apiClient } from '../../api/client';
import type { CreateSubscriberRequest, Subscriber, UpdateSubscriberRequest } from '../../types';

export async function getSubscribers(): Promise<Subscriber[]> {
  const { data } = await apiClient.get<Subscriber[]>('/subscribers');
  return data;
}

export async function createSubscriber(request: CreateSubscriberRequest): Promise<Subscriber> {
  const { data } = await apiClient.post<Subscriber>('/subscribers', request);
  return data;
}

export async function updateSubscriber(id: string, request: UpdateSubscriberRequest): Promise<Subscriber> {
  const { data } = await apiClient.put<Subscriber>(`/subscribers/${id}`, request);
  return data;
}
