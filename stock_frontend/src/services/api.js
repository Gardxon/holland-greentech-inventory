import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    } else if (!error.response) {
      console.error('Network error - is the server running?');
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  getInventoryByBranch: () => api.get('/dashboard/inventory-by-branch'),

  // Inventory
  getBranchInventory: (branchId) => api.get(`/inventory/branch/${branchId}`),
  addStockDirect: (branchId, productId, quantity, reason) =>
    api.post('/inventory/add-stock/direct', null, {
      params: { branch_id: branchId, product_id: productId, quantity, reason }
    }),

  // Sales
  createSale: (data) => api.post('/sales/', data),
  getSales: (skip = 0, limit = 50, branchId = null) =>
    api.get('/sales/', { params: { skip, limit, branch_id: branchId } }),
  getSalesSummary: (days = 30) => api.get('/sales/summary', { params: { days } }),

  // Stock Requests
  createStockRequest: (data) => api.post('/stock-requests/', data),
  getStockRequests: (skip = 0, limit = 50, branchId = null, status = null) =>
    api.get('/stock-requests/', { params: { skip, limit, branch_id: branchId, status } }),
  approveStockRequest: (requestId) => api.patch(`/stock-requests/${requestId}/approve`),
  rejectStockRequest: (requestId) => api.patch(`/stock-requests/${requestId}/reject`),

  // CSV Exports
  exportInventoryCSV: () => api.get('/dashboard/export-inventory/csv', { responseType: 'blob' }),
  exportSalesCSV: (days = 30) => api.get(`/dashboard/export-sales/csv`, { params: { days }, responseType: 'blob' }),
  exportMovementsCSV: () => api.get('/dashboard/export-movements/csv', { responseType: 'blob' }),
};

export default api;
