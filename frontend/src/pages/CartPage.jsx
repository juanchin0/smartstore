import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/utils'

const TAX_RATE = 0.10

function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart()

  return (
    <div className="flex gap-4 py-5 border-b border-border last:border-0 group">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl bg-muted border border-border overflow-hidden shrink-0
                      flex items-center justify-center">
        {item.image
          ? <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          : <ShoppingBag size={24} className="text-muted-foreground/30" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-0.5">
          {item.name}
        </p>
        {item.store_name && (
          <p className="text-xs text-muted-foreground mb-3">{item.store_name}</p>
        )}

        {/* Quantity + price row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quantity control */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
              className="w-7 h-7 rounded-md flex items-center justify-center
                         text-muted-foreground hover:text-foreground hover:bg-card
                         transition-colors"
            >
              <Minus size={13} />
            </button>
            <span className="w-7 text-center text-sm font-medium font-data text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
              className="w-7 h-7 rounded-md flex items-center justify-center
                         text-muted-foreground hover:text-foreground hover:bg-card
                         transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          <span className="text-xs text-muted-foreground">
            × {formatPrice(item.price)}
          </span>

          <span className="text-sm font-semibold font-data text-foreground ml-auto">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeFromCart(item.product_id)}
        className="self-start mt-1 w-8 h-8 rounded-lg flex items-center justify-center
                   text-muted-foreground hover:text-destructive hover:bg-destructive/8
                   transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function OrderSummary({ subtotal, onCheckout }) {
  const taxes = subtotal * TAX_RATE
  const total = subtotal + taxes

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
      <h2 className="font-display font-bold text-foreground text-base mb-4">
        Resumen del pedido
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-data text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Impuestos (IVA 10%)</span>
          <span className="font-data text-foreground">{formatPrice(taxes)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Envío</span>
          <span className="text-success font-medium">Gratis</span>
        </div>
        <div className="pt-3 border-t border-border flex justify-between font-semibold text-base">
          <span className="text-foreground">Total</span>
          <span className="font-data text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Promo input */}
      <div className="mt-4 flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-input border border-border
                        rounded-lg text-sm text-muted-foreground">
          <Tag size={13} />
          <input
            type="text"
            placeholder="Código de descuento"
            className="flex-1 bg-transparent outline-none text-xs"
          />
        </div>
        <button className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg
                           text-xs font-medium hover:bg-secondary/80 transition-colors">
          Aplicar
        </button>
      </div>

      <button
        onClick={onCheckout}
        className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl
                   font-medium text-sm hover:bg-primary/90 transition-colors
                   active:scale-[0.98] shadow-sm shadow-primary/20"
      >
        Proceder al pago →
      </button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pago seguro · Garantía de devolución
      </p>
    </div>
  )
}

export default function CartPage() {
  const { items, count, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Tu carrito</h1>
                <p className="text-xs text-muted-foreground">
                  {count === 0 ? 'Vacío' : `${count} ${count === 1 ? 'artículo' : 'artículos'}`}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-xs text-muted-foreground
                           hover:text-destructive transition-colors"
              >
                <Trash2 size={13} />
                Vaciar carrito
              </button>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
                <ShoppingCart size={32} className="text-muted-foreground/30" />
              </div>
              <h2 className="font-display font-bold text-lg text-foreground mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Explora nuestras tiendas y añade productos que te gusten.
              </p>
              <Link
                to="/"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground
                           rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft size={15} />
                Explorar tiendas
              </Link>
            </div>
          )}

          {/* Cart + summary */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items list */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-2xl px-5 divide-y divide-border/0">
                  {items.map(item => <CartItem key={item.product_id} item={item} />)}
                </div>

                <div className="mt-4">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
                               hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Continuar comprando
                  </Link>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  subtotal={subtotal}
                  onCheckout={() => navigate('/checkout')}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
