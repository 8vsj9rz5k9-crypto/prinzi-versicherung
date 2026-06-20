import { Policy, apiClient, fetchOrMock, mockPolicies } from '@/services/api';

const policyStore = [...mockPolicies];

export const policiesService = {
  async listPolicies(): Promise<Policy[]> {
    return fetchOrMock(() => apiClient.get<Policy[]>('/policies'), policyStore);
  },
  async getPolicyById(id: string): Promise<Policy | null> {
    const fallback = policyStore.find((policy) => policy.id === id) ?? null;
    return fetchOrMock(() => apiClient.get<Policy>(`/policies/${id}`), fallback);
  }
};
