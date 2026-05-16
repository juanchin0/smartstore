import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
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

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={next} replace />

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'Requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(next, { replace: true })
    } catch (err) {
      setServerError(err.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <Link to="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Smart<span className="text-primary">Store</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h1 className="font-display font-bold text-xl text-foreground mb-1">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mb-6">Accede a tu cuenta SmartStore</p>

          {serverError && (
            <div className="mb-4 px-3 py-2.5 bg-destructive/10 border border-destructive/30
                            rounded-xl text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email"
              icon={Mail}
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
            />
            <Field
              label="Contraseña"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2',
                'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]',
              )}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Entrando…</span>
                : 'Iniciar sesión'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
