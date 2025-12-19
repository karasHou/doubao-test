// 直接指定 API 地址
const API_BASE_URL = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data as T;
}

// 食材相关 API
export const ingredientsApi = {
  getAll: () => request<any[]>('/ingredients'),
  getOne: (id: string) => request<any>(`/ingredients/${id}`),
  create: (data: any) => request<any>('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/ingredients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/ingredients/${id}`, { method: 'DELETE' }),
  getExpired: () => request<any[]>('/ingredients/status/expired'),
  getExpiringSoon: () => request<any[]>('/ingredients/status/expiring-soon'),
};

// 菜谱相关 API
export const recipesApi = {
  getAll: (query: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    const queryString = params.toString();
    return request<any[]>(`/recipes${queryString ? `?${queryString}` : ''}`);
  },
  getOne: (id: string) => request<any>(`/recipes/${id}`),
  getIngredients: (id: string) => request<any[]>(`/recipes/${id}/ingredients`),
};

// 推荐相关 API
export const recommendationsApi = {
  getRecommendations: () => request<any>('/recommendations'),
  getByIngredients: (ingredientIds: string[]) => {
    const ids = ingredientIds.join(',');
    return request<any[]>(`/recommendations/by-ingredients?ingredient_ids=${ids}`);
  },
};
