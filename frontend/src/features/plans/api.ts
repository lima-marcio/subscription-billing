import { apiClient } from '../../api/client';
import type { CreatePlanRequest, Plan, UpdatePlanRequest } from '../../types';

export async function getPlans(): Promise<Plan[]> {
  const { data } = await apiClient.get<Plan[]>('/plans');
  return data;
}

export async function createPlan(request: CreatePlanRequest): Promise<Plan> {
  const { data } = await apiClient.post<Plan>('/plans', request);
  return data;
}

export async function updatePlan(id: string, request: UpdatePlanRequest): Promise<Plan> {
  const { data } = await apiClient.put<Plan>(`/plans/${id}`, request);
  return data;
}

export async function archivePlan(id: string): Promise<Plan> {
  const { data } = await apiClient.post<Plan>(`/plans/${id}/archive`);
  return data;
}

export async function unarchivePlan(id: string): Promise<Plan> {
  const { data } = await apiClient.post<Plan>(`/plans/${id}/unarchive`);
  return data;
}
