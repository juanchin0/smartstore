import api from './axiosConfig'

export const getOntologyClasses = async () => {
  const { data } = await api.get('/api/ontology/classes/')
  return data
}

export const getOntologyFilters = async (className) => {
  const { data } = await api.get('/api/ontology/filters/', {
    params: { class: className },
  })
  return data
}

export const semanticSearch = async ({ query, store_id = null }) => {
  const { data } = await api.post('/api/ontology/semantic-search/', {
    query,
    ...(store_id && { store_id }),
  })
  return data
}

export const inferTags = async (product_id) => {
  const { data } = await api.post('/api/ontology/infer/', { product_id })
  return data
}

export const getSearchSuggestions = async (q) => {
  const { data } = await api.get('/api/ontology/suggestions/', { params: { q } })
  return data
}
