import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, CheckCircle, ArrowLeft, Lock,
  User, Mail, MapPin, Phone, CreditCard, Package,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, cn } from '../lib/utils'

const TAX_RATE = 0.10

function Field({ label, icon: Icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-input border border-border rounded-xl
                      focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15
                      transition-all">
        {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
        <input
          {...props}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
    </div>
  )
}

function SuccessScreen({ orderNumber, items, total, onContinue }) {
  return (
    <div className="flex flex-col items-center text-center py-10 fade-up">
      {/* Animated checkmark */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle size={36} className="text-success" />
          </div>
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-2 border-success/20 animate-ping" />
      </div>

      <h1 className="font-display font-bold text-2xl text-foreground mb-2">
        ¡Compra realizada!
      </h1>
      <p className="text-sm text-muted-foreground mb-1">
        Tu pedido ha sido confirmado exitosamente
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/8 border border-success/20
                      rounded-full text-success text-sm font-medium mt-2 mb-8">
        <Package size={14} />
        Orden #{orderNumber}
      </div>

      {/* Order recap */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden mb-8">
        <div className="px-4 py-3 bg-muted/40 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Resumen del pedido
          </p>
        </div>
        <div className="divide-y divide-border">
          {items.map(item => (
            <div key={item.product_id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {item.image
                  ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                  : <ShoppingBag size={14} className="text-muted-foreground/40" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <span className="text-xs font-data font-medium text-foreground shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 font-semibold text-sm">
            <span className="text-foreground">Total pagado</span>
            <span className="font-data text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground
                     rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Continuar comprando
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground
                     rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors text-center"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber] = useState(() => Math.floor(10000 + Math.random() * 90000))

  // Snapshot taken at the moment the order is confirmed — used by SuccessScreen
  // so the recap still shows the products even after clearCart() is called.
  const [orderedItems, setOrderedItems] = useState([])
  const [orderedTotal, setOrderedTotal] = useState(0)

  const taxes = subtotal * TAX_RATE
  const total = subtotal + taxes

  const [form, setForm] = useState({
    name: '', email: '', address: '', city: '', phone: '',
  })

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.full_name || f.name,
        email: user.email || f.email,
        phone: user.profile?.phone || f.phone,
        city: user.profile?.city || f.city,
        address: user.profile?.address || f.address,
      }))
    }
  }, [user])
  const [errors, setErrors] = useState({})

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // Snapshot before anything changes
    const snapshot = [...items]
    const totalSnapshot = total

    await new Promise(r => setTimeout(r, 1400)) // simulate API call

    // Clear cart BEFORE showing success screen
    clearCart()
    setOrderedItems(snapshot)
    setOrderedTotal(totalSnapshot)
    setLoading(false)
    setSuccess(true)
  }

  // Just navigate — cart is already cleared by handleSubmit
  const handleContinue = () => {
    navigate('/')
  }

  // Redirect if cart is empty and not coming from success
  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No hay nada que pagar.</p>
            <Link to="/carrito" className="text-sm text-primary hover:underline">Ver carrito</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {success ? (
            <SuccessScreen
              orderNumber={orderNumber}
              items={orderedItems}
              total={orderedTotal}
              onContinue={handleContinue}
            />
          ) : (
            <>
              {/* Back */}
              <Link
                to="/carrito"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
                           hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft size={14} />
                Volver al carrito
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2">
                  <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Lock size={15} className="text-success" />
                      <h2 className="font-display font-bold text-base text-foreground">
                        Datos de envío
                      </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Field
                            label="Nombre completo *"
                            icon={User}
                            type="text"
                            placeholder="Ana García"
                            value={form.name}
                            onChange={e => update('name', e.target.value)}
                          />
                          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <Field
                            label="Email *"
                            icon={Mail}
                            type="email"
                            placeholder="ana@email.com"
                            value={form.email}
                            onChange={e => update('email', e.target.value)}
                          />
                          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      <Field
                        label="Dirección"
                        icon={MapPin}
                        type="text"
                        placeholder="Calle y número"
                        value={form.address}
                        onChange={e => update('address', e.target.value)}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Ciudad"
                          icon={MapPin}
                          type="text"
                          placeholder="Ciudad de México"
                          value={form.city}
                          onChange={e => update('city', e.target.value)}
                        />
                        <Field
                          label="Teléfono"
                          icon={Phone}
                          type="tel"
                          placeholder="+52 55 1234 5678"
                          value={form.phone}
                          onChange={e => update('phone', e.target.value)}
                        />
                      </div>

                      {/* Payment section */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard size={15} className="text-muted-foreground" />
                          <h3 className="font-medium text-sm text-foreground">Pago (simulado)</h3>
                        </div>

                        <div className="p-4 bg-muted/40 border border-border rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            {['visa', 'mc', 'amex'].map(card => (
                              <div key={card} className="px-2.5 py-1 bg-card border border-border
                                                          rounded-md text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                {card}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Entorno de demostración — no se realizan cobros reales.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                          'w-full py-3.5 rounded-xl text-sm font-semibold transition-all',
                          'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                          loading
                            ? 'opacity-70 cursor-not-allowed'
                            : 'hover:bg-primary/90 active:scale-[0.98]'
                        )}
                      >
                        {loading
                          ? 'Procesando pago…'
                          : `Completar compra · ${formatPrice(total)}`
                        }
                      </button>
                    </form>
                  </div>
                </div>

                {/* Order summary sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
                    <div className="px-4 py-3.5 border-b border-border">
                      <h2 className="font-display font-bold text-sm text-foreground">
                        Tu pedido ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                      </h2>
                    </div>

                    <div className="divide-y divide-border max-h-64 overflow-y-auto scrollbar-thin">
                      {items.map(item => (
                        <div key={item.product_id} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-9 h-9 rounded-lg bg-muted overflow-hidden shrink-0">
                            {item.image
                              ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag size={12} className="text-muted-foreground/30" />
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">×{item.quantity}</p>
                          </div>
                          <span className="text-xs font-data text-foreground shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-4 border-t border-border space-y-2.5 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-data text-foreground">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>IVA (10%)</span>
                        <span className="font-data text-foreground">{formatPrice(taxes)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Envío</span>
                        <span className="text-success font-medium">Gratis</span>
                      </div>
                      <div className="pt-2.5 border-t border-border flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="font-data text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
