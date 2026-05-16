import api from './axiosConfig'

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/api/products/', { params })
  return Array.isArray(data) ? data : (data.results ?? [])
}

export const getProduct = async (id) => {
  const { data } = await api.get(`/api/products/${id}/`)
  return data
}
