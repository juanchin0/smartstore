import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag, ShoppingCart, Heart, Share2,
  Package, CheckCircle, XCircle, Sparkles, Award,
  Truck, RotateCcw, Shield, ChevronRight, Star,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Breadcrumb from '../components/ui/Breadcrumb'
import RatingStars from '../components/ui/RatingStars'
import ProductCard from '../components/ui/ProductCard'
import { ProductCardSkeleton } from '../components/ui/LoadingGrid'
import { getProduct } from '../api/products'
import { getStore, getStoreProducts } from '../api/stores'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, cn } from '../lib/utils'

// ── Spec schemas: detect product type from semantic_tags ──────────────────
const SPEC_SCHEMAS = {
  Laptop: {
    labels: ['Marca', 'Procesador', 'RAM', 'Almacenamiento', 'Pantalla', 'GPU'],
    detect: (tags) => tags.some(t => /ssd|hdd|m[23]\s?(pro|max)?|ryzen|core i[357]/i.test(t)),
  },
  Smartphone: {
    labels: ['Marca', 'Modelo', 'OS', 'Pantalla', 'Batería', 'Cámara', 'Conectividad'],
    detect: (tags) => tags.some(t => /android|ios|iphone/i.test(t)),
  },
  RunningShoe: {
    labels: ['Superficie', 'Amortiguación', 'Drop', 'Peso', 'Talla', 'Material', 'Género', 'Color'],
    detect: (tags) => tags.some(t => /asfalto|trail|neutro|pronac|supinac/i.test(t)),
  },
  Clothing: {
    labels: ['Talla', 'Género', 'Material', 'Color'],
    detect: (tags) => tags.some(t => /algodón|poliéster|lino|denim|spandex/i.test(t)),
  },
}

function getSpecs(tags) {
  if (!tags?.length) return null
  for (const [type, schema] of Object.entries(SPEC_SCHEMAS)) {
    if (schema.detect(tags)) {
      const pairs = schema.labels
        .map((label, i) => ({ label, value: tags[i] ?? null }))
        .filter(p => p.value)
      if (pairs.length) return { type, pairs }
    }
  }
  return null
}

// ── Rating distribution bars ───────────────────────────────────────────────
function getRatingBars(rating, count) {
  const r = Math.max(1, Math.min(5, Number(rating) || 3))
  const n = Math.max(1, count)
  // Weight distribution centered on rating
  const weights = [5, 4, 3, 2, 1].map(s => Math.max(1, Math.pow(4, -(Math.abs(s - r)))))
  const total = weights.reduce((a, b) => a + b, 0)
  return [5, 4, 3, 2, 1].map((stars, i) => ({
    stars,
    pct: Math.round((weights[i] / total) * 100),
    count: Math.round((weights[i] / total) * n),
  }))
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ImagePanel({ image, name }) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border',
          image ? (zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : 'cursor-default'
        )}
        onMouseEnter={() => image && setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-500 ease-out',
                zoomed ? 'scale-[1.3]' : 'scale-100'
              )}
            />
            <div className={cn(
              'absolute bottom-3 right-3 px-2.5 py-1.5 bg-foreground/55 backdrop-blur-sm',
              'text-background text-[10px] font-medium rounded-lg transition-opacity duration-200',
              zoomed ? 'opacity-0' : 'opacity-100'
            )}>
              Hover para ampliar
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ShoppingBag size={56} className="text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground/40">Sin imagen</p>
          </div>
        )}
      </div>

      {/* Thumbnail strip — ready for multi-image */}
      {image && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <button className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary
                             shrink-0 ring-2 ring-primary/20 transition-all">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        </div>
      )}
    </div>
  )
}

function StockBadge({ stock }) {
  if (stock === undefined || stock === null) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-success/10 text-success">
        <CheckCircle size={13} />
        En stock
      </div>
    )
  }
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
      stock > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
    )}>
      {stock > 0
        ? <><CheckCircle size={13} /> En stock ({stock} disponibles)</>
        : <><XCircle size={13} /> Agotado</>
      }
    </div>
  )
}

function SpecsSection({ tags }) {
  const specs = getSpecs(tags)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-semantic/10 flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-semantic" />
        </div>
        <h2 className="font-display font-bold text-sm text-foreground">
          Especificaciones técnicas
          {specs && (
            <span className="ml-2 text-xs text-muted-foreground font-normal normal-case">
              · {specs.type}
            </span>
          )}
        </h2>
      </div>

      {specs ? (
        <div className="px-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
            {specs.pairs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground shrink-0 mr-4 w-28">{label}</span>
                <span className="text-xs font-medium text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full
                         text-xs font-medium text-secondary-foreground"
            >
              <Sparkles size={9} className="text-semantic" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewsSection({ rating, ratingCount }) {
  const bars = useMemo(() => getRatingBars(rating, ratingCount), [rating, ratingCount])
  const isHighlyRated = Number(rating) >= 4.5

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-bold text-sm text-foreground">Valoraciones de clientes</h2>
      </div>

      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          {/* Overall score */}
          <div className="flex flex-col items-center sm:items-start sm:w-36 shrink-0">
            <span className="font-display font-bold text-6xl text-foreground leading-none mb-3">
              {Number(rating).toFixed(1)}
            </span>
            <RatingStars rating={Number(rating)} size={18} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {ratingCount.toLocaleString()} {ratingCount === 1 ? 'valoración' : 'valoraciones'}
            </p>

            {isHighlyRated && (
              <div className="mt-4 flex items-center gap-1.5 px-3 py-2 bg-sale/10
                              text-sale rounded-xl text-xs font-semibold">
                <Award size={13} />
                Altamente valorado
              </div>
            )}
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2.5">
            {bars.map(bar => (
              <div key={bar.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-7 shrink-0">
                  <Star size={11} className="fill-sale text-sale" />
                  <span className="text-xs text-muted-foreground leading-none">{bar.stars}</span>
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sale rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-9 text-right font-data shrink-0">
                  {bar.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground border-t border-border pt-4">
          Basado en compras verificadas de {ratingCount.toLocaleString()} clientes.
        </p>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { storeSlug, productId } = useParams()
  const navigate = useNavigate()
  const { addToCart, items } = useCart()
  const { toast } = useToast()
  const [favorited, setFavorited] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const { data: product, isLoading: productLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  })

  const { data: store } = useQuery({
    queryKey: ['store', storeSlug],
    queryFn: () => getStore(storeSlug),
    enabled: !!storeSlug,
  })

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['store-products', storeSlug, 'detail-related'],
    queryFn: () => getStoreProducts(storeSlug),
    enabled: !!storeSlug,
    select: (data) => data.filter(p => String(p.id) !== String(productId)).slice(0, 4),
  })

  const inCart = product ? items.some(i => i.product_id === product.id) : false

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      ...product,
      store_slug: product.store_slug || storeSlug,
      store_name: product.store_name || store?.name || '',
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
    toast(
      inCart
        ? `+1 ${product.name.slice(0, 35)}`
        : `${product.name.slice(0, 35)}… añadido`,
      { action: { label: 'Ver carrito', onClick: () => navigate('/carrito') } }
    )
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: product?.name, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => toast('URL copiada al portapapeles'))
    }
  }

  const breadcrumb = [
    { label: 'Tiendas', href: '/' },
    { label: store?.name ?? storeSlug, href: `/tienda/${storeSlug}` },
    { label: product?.name ?? '…' },
  ]

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (productLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="h-4 w-72 shimmer rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="aspect-square shimmer rounded-2xl" />
              <div className="space-y-5">
                <div className="h-4 w-32 shimmer rounded-lg" />
                <div className="h-7 w-4/5 shimmer rounded-lg" />
                <div className="h-7 w-3/5 shimmer rounded-lg" />
                <div className="flex gap-1 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-5 h-5 shimmer rounded" />
                  ))}
                  <div className="w-16 h-5 shimmer rounded ml-2" />
                </div>
                <div className="h-10 w-1/3 shimmer rounded-lg" />
                <div className="h-8 w-40 shimmer rounded-lg" />
                <div className="pt-2 space-y-3">
                  <div className="h-12 w-full shimmer rounded-xl" />
                  <div className="flex gap-3">
                    <div className="h-12 w-12 shimmer rounded-xl" />
                    <div className="h-12 w-12 shimmer rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Producto no encontrado</p>
            <p className="text-xs text-muted-foreground mb-5">
              El producto que buscas no existe o fue eliminado.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to={`/tienda/${storeSlug}`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl
                           text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Ver tienda
              </Link>
              <Link
                to="/"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl
                           text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Inicio
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const hasDiscount =
    Number(product.discount_percent) > 0 &&
    product.compare_price &&
    Number(product.compare_price) > Number(product.price)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">

          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumb} />

          {/* ── 2-column hero ──────────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* LEFT: Image */}
            <ImagePanel image={product.image} name={product.name} />

            {/* RIGHT: Details */}
            <div className="flex flex-col gap-5">

              {/* Store badge */}
              <Link
                to={`/tienda/${storeSlug}`}
                className="inline-flex items-center gap-2 self-start px-3 py-1.5
                           bg-secondary hover:bg-primary/8 border border-border hover:border-primary/20
                           rounded-lg transition-all group"
              >
                {store?.logo ? (
                  <img src={store.logo} alt="" className="w-5 h-5 rounded object-contain" />
                ) : (
                  <Package size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                <span className="text-xs font-medium text-muted-foreground
                                 group-hover:text-primary transition-colors">
                  {store?.name ?? storeSlug}
                </span>
              </Link>

              {/* Name */}
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <RatingStars rating={Number(product.rating)} count={product.rating_count} size={16} />
                {Number(product.rating) >= 4.5 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sale">
                    <Award size={12} />
                    Altamente valorado
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 flex-wrap">
                <span className="font-display font-bold text-3xl sm:text-4xl text-foreground font-data">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted-foreground line-through font-data mb-0.5">
                      {formatPrice(product.compare_price)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 bg-destructive
                                     text-destructive-foreground rounded-lg text-sm font-bold font-data mb-0.5">
                      -{Number(product.discount_percent)}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <StockBadge stock={product.stock} />

              <div className="border-t border-border" />

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl',
                    'text-sm font-semibold transition-all duration-200 active:scale-[0.98]',
                    justAdded
                      ? 'bg-success text-success-foreground'
                      : product.stock === 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
                  )}
                >
                  <ShoppingCart size={16} />
                  {justAdded
                    ? 'Añadido al carrito'
                    : inCart ? 'Añadir más' : 'Añadir al carrito'
                  }
                </button>

                <button
                  onClick={() => setFavorited(f => !f)}
                  title={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  className={cn(
                    'flex items-center justify-center w-14 rounded-xl border transition-all active:scale-[0.97]',
                    favorited
                      ? 'bg-destructive/10 border-destructive/30 text-destructive'
                      : 'border-border text-muted-foreground hover:border-destructive/30 hover:text-destructive hover:bg-destructive/5'
                  )}
                >
                  <Heart size={18} className={favorited ? 'fill-current' : ''} />
                </button>

                <button
                  onClick={handleShare}
                  title="Compartir producto"
                  className="flex items-center justify-center w-14 rounded-xl border border-border
                             text-muted-foreground hover:border-primary/30 hover:text-primary
                             hover:bg-primary/5 transition-all active:scale-[0.97]"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Truck, label: 'Envío gratis' },
                  { icon: RotateCcw, label: '30 días devolución' },
                  { icon: Shield, label: 'Compra segura' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label}
                    className="flex flex-col items-center gap-1.5 py-3 px-2
                               bg-secondary/50 rounded-xl text-center"
                  >
                    <Icon size={15} className="text-primary" />
                    <span className="text-[10px] text-muted-foreground leading-snug">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Specs ─────────────────────────────────────────────────── */}
          {product.semantic_tags?.length > 0 && (
            <div className="mt-10">
              <SpecsSection tags={product.semantic_tags} />
            </div>
          )}

          {/* ── Related products ──────────────────────────────────────── */}
          {relatedProducts.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-foreground">
                  También de {store?.name ?? storeSlug}
                </h2>
                <Link
                  to={`/tienda/${storeSlug}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Ver todo
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
                ))}
              </div>
            </div>
          )}

          {/* ── Reviews ───────────────────────────────────────────────── */}
          {product.rating_count > 0 && (
            <div className="mt-10">
              <ReviewsSection
                rating={product.rating}
                ratingCount={product.rating_count}
              />
            </div>
          )}

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
