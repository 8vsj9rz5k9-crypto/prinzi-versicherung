import { Customer, apiClient, fetchOrMock, mockCustomers } from '@/services/api';

const customerStore = [...mockCustomers];

export const customersService = {
  async listCustomers(): Promise<Customer[]> {
    return fetchOrMock(() => apiClient.get<Customer[]>('/customers'), customerStore);
  },
  async getCustomerById(id: string): Promise<Customer | null> {
    const fallback = customerStore.find((customer) => customer.id === id) ?? null;
    return fetchOrMock(() => apiClient.get<Customer>(`/customers/${id}`), fallback);
  }
};
