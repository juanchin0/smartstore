import api from './axiosConfig'

export const authApi = {
  register: (data) =>
    api.post('/api/auth/register/', data).then(r => r.data),

  login: (email, password) =>
    api.post('/api/auth/login/', { email, password }).then(r => r.data),

  logout: (refresh) =>
    api.post('/api/auth/logout/', { refresh }).then(r => r.data),

  me: () =>
    api.get('/api/auth/me/').then(r => r.data),

  updateProfile: (data) =>
    api.put('/api/auth/profile/', data).then(r => r.data),

  refreshToken: (refresh) =>
    api.post('/api/auth/token/refresh/', { refresh }).then(r => r.data),

  getOrders: () =>
    api.get('/api/auth/orders/').then(r => r.data),

  createOrder: (data) =>
    api.post('/api/auth/orders/', data).then(r => r.data),

  updateOrderStatus: (id, status) =>
    api.patch(`/api/auth/orders/${id}/`, { status }).then(r => r.data),
}
