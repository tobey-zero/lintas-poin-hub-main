/**
 * API Helper untuk handle server-side database operations
 * Digunakan oleh admin routes untuk mutations
 */

export async function apiCall<T>(
  method: string,
  path: string,
  data?: any
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  articles: {
    getAll: () => apiCall('/api/articles', 'GET'),
    getById: (id: string) => apiCall(`/api/articles/${id}`, 'GET'),
    create: (data: any) => apiCall('/api/articles', 'POST', data),
    update: (id: string, data: any) => apiCall(`/api/articles/${id}`, 'PUT', data),
    delete: (id: string) => apiCall(`/api/articles/${id}`, 'DELETE'),
  },
  categories: {
    getAll: () => apiCall('/api/categories', 'GET'),
    getById: (id: string) => apiCall(`/api/categories/${id}`, 'GET'),
    create: (data: any) => apiCall('/api/categories', 'POST', data),
    update: (id: string, data: any) => apiCall(`/api/categories/${id}`, 'PUT', data),
    delete: (id: string) => apiCall(`/api/categories/${id}`, 'DELETE'),
  },
  breakingNews: {
    getAll: () => apiCall('/api/breaking-news', 'GET'),
    create: (data: any) => apiCall('/api/breaking-news', 'POST', data),
    update: (id: string, data: any) => apiCall(`/api/breaking-news/${id}`, 'PUT', data),
    delete: (id: string) => apiCall(`/api/breaking-news/${id}`, 'DELETE'),
  },
  settings: {
    get: () => apiCall('/api/settings', 'GET'),
    update: (data: any) => apiCall('/api/settings', 'PUT', data),
  },
};
