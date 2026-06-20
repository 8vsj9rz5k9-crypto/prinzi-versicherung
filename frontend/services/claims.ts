import { Claim, apiClient, fetchOrMock, mockClaims } from '@/services/api';

const claimStore = [...mockClaims];

export const claimsService = {
  async listClaims(): Promise<Claim[]> {
    return fetchOrMock(() => apiClient.get<Claim[]>('/claims'), claimStore);
  },
  async getClaimById(id: string): Promise<Claim | null> {
    const fallback = claimStore.find((claim) => claim.id === id) ?? null;
    return fetchOrMock(() => apiClient.get<Claim>(`/claims/${id}`), fallback);
  }
};
