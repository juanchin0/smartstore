import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Home, ShoppingBag,
  Save, LogOut, Loader2, CheckCircle,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/utils'

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 bg-input border rounded-xl transition-all',
        'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15',
        error ? 'border-destructive/60' : 'border-border',
      )}>
        {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
        <input
          {...props}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function Avatar({ user }) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'
  if (user?.profile?.avatar) {
    return <img src={user.profile.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
  }
  return (
    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20
                     flex items-center justify-center font-bold text-xl text-primary">
      {initials}
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', city: '', address: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        address: user.profile?.address || '',
      })
    }
  }, [user])

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setSaved(false)
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true)
      toast('Perfil actualizado', { type: 'success' })
    } catch (err) {
      toast(err.message || 'Error al guardar', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleChangePassword = () => {
    toast('Cambio de contraseña próximamente disponible', { type: 'info' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Profile header */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar user={user} />
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">
                {user?.full_name || 'Mi perfil'}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Edit form */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-semibold text-base text-foreground mb-5 flex items-center gap-2">
                <User size={16} className="text-primary" />
                Información personal
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Nombre completo *"
                    icon={User}
                    type="text"
                    placeholder="Ana García"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    error={errors.full_name}
                  />
                  <Field
                    label="Email *"
                    icon={Mail}
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    error={errors.email}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Teléfono"
                    icon={Phone}
                    type="tel"
                    placeholder="+52 55 0000 0000"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                  />
                  <Field
                    label="Ciudad"
                    icon={MapPin}
                    type="text"
                    placeholder="Ciudad de México"
                    value={form.city}
                    onChange={e => update('city', e.target.value)}
                  />
                </div>
                <Field
                  label="Dirección"
                  icon={Home}
                  type="text"
                  placeholder="Calle, número, colonia"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                />

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                      saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]',
                    )}
                  >
                    {saving
                      ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                      : saved
                        ? <><CheckCircle size={14} /> Guardado</>
                        : <><Save size={14} /> Guardar cambios</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground
                               hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Cambiar contraseña
                  </button>
                </div>
              </form>
            </div>

            {/* Purchase history placeholder */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Mis compras
              </h2>
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <ShoppingBag size={20} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Sin compras aún</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tu historial de pedidos aparecerá aquí
                </p>
              </div>
            </div>

            {/* Logout */}
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
