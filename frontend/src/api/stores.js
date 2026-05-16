import api from './axiosConfig'

export const getStores = async () => {
  const { data } = await api.get('/api/stores/')
  return Array.isArray(data) ? data : (data.results ?? [])
}

export const getStore = async (slug) => {
  const { data } = await api.get(`/api/stores/${slug}/`)
  return data
}

export const getStoreProducts = async (slug, params = {}) => {
  const { data } = await api.get(`/api/stores/${slug}/products/`, { params })
  return Array.isArray(data) ? data : (data.results ?? [])
}
