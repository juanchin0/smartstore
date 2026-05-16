import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ss_access')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('ss_access')
        localStorage.removeItem('ss_refresh')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('ss_access', data.access)
    localStorage.setItem('ss_refresh', data.refresh)
    const me = await authApi.me()
    setUser(me)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('ss_refresh')
    try { if (refresh) await authApi.logout(refresh) } catch {}
    localStorage.removeItem('ss_access')
    localStorage.removeItem('ss_refresh')
    setUser(null)
  }

  const register = async (formData) => {
    const data = await authApi.register(formData)
    localStorage.setItem('ss_access', data.access)
    localStorage.setItem('ss_refresh', data.refresh)
    setUser(data.user)
  }

  const updateProfile = async (formData) => {
    const updated = await authApi.updateProfile(formData)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
