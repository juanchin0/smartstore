import { useState, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpDown, Package, LayoutGrid, Sparkles, X } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Breadcrumb from '../components/ui/Breadcrumb'
import FilterPanel from '../components/ui/FilterPanel'
import ProductCard from '../components/ui/ProductCard'
import { ProductCardSkeleton } from '../components/ui/LoadingGrid'
import { getStore, getStoreProducts } from '../api/stores'
import { getOntologyFilters } from '../api/ontology'
import { cn } from '../lib/utils'

const SORT_OPTIONS = [
  { value: '', label: 'Relevancia' },
  { value: 'price', label: 'Precio ↑' },
  { value: '-price', label: 'Precio ↓' },
  { value: '-rating', label: 'Valoración ↓' },
  { value: '-created_at', label: 'Más nuevos' },
]

function buildQueryParams(activeFilters, ordering) {
  const params = {}
  if (ordering) params.ordering = ordering
  if (activeFilters.price_min) params.price_min = activeFilters.price_min
  if (activeFilters.price_max) params.price_max = activeFilters.price_max
  if (activeFilters.rating_min) params.rating_min = activeFilters.rating_min
  if (activeFilters.has_discount) params.has_discount = true
  Object.entries(activeFilters).forEach(([k, v]) => {
    if (['price_min', 'price_max', 'rating_min', 'has_discount'].includes(k)) return
    if (!v || (Array.isArray(v) && v.length === 0)) return
    params[k] = Array.isArray(v) ? v.join(',') : v
  })
  return params
}

export default function StorePage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [activeFilters, setActiveFilters] = useState({})
  const [ordering, setOrdering] = useState('')
  const [logoError, setLogoError] = useState(false)
  const [bannerError, setBannerError] = useState(false)

  // ── Semantic state from URL ──────────────────────────────────────────────
  const semanticClass = searchParams.get('semantic_class') || null
  const semanticIds = useMemo(() => {
    const raw = searchParams.get('products')
    if (!raw) return null
    const ids = raw.split(',').map(s => s.trim()).filter(Boolean)
    return ids.length ? new Set(ids) : null
  }, [searchParams])

  const clearSemantic = () => {
    setSearchParams({})
  }

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStore(slug),
    enabled: !!slug,
  })

  const ontologyClass = semanticClass || null

  const { data: ontologyFilters = {} } = useQuery({
    queryKey: ['ontology-filters', ontologyClass],
    queryFn: () => getOntologyFilters(ontologyClass).then(d => d.filters ?? {}),
    enabled: !!ontologyClass,
  })

  const queryParams = buildQueryParams(activeFilters, ordering)

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['store-products', slug, queryParams],
    queryFn: () => getStoreProducts(slug, queryParams),
    enabled: !!slug,
  })

  // ── Float semantic matches to top ────────────────────────────────────────
  const finalProducts = useMemo(() => {
    if (!semanticIds) return products
    const matched = products.filter(p => semanticIds.has(String(p.id)))
    const rest = products.filter(p => !semanticIds.has(String(p.id)))
    return [...matched, ...rest]
  }, [products, semanticIds])

  const semanticMatchCount = semanticIds
    ? finalProducts.filter(p => semanticIds.has(String(p.id))).length
    : 0

  const breadcrumb = [
    { label: 'Tiendas', href: '/' },
    { label: store?.name ?? slug },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Store banner ──────────────────────────────────────────────── */}
        <div className={cn(
          'relative h-44 sm:h-56 overflow-hidden border-b border-border',
          store?.banner && !bannerError ? 'bg-black' : 'bg-gradient-to-br from-secondary via-muted to-secondary',
        )}>
          {store?.banner && !bannerError && (
            <img
              src={store.banner}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
              onError={() => setBannerError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />

          <div className="relative h-full max-w-6xl mx-auto px-4 flex items-end pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card/95 border border-border
                              flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden backdrop-blur-sm">
                {store?.logo && !logoError
                  ? <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={() => setLogoError(true)}
                    />
                  : <Package size={24} className="text-primary" />
                }
              </div>
              <div>
                {storeLoading ? (
                  <>
                    <div className="h-5 w-40 shimmer rounded mb-1.5" />
                    <div className="h-3.5 w-28 shimmer rounded" />
                  </>
                ) : (
                  <>
                    <h1 className="text-lg sm:text-xl font-display font-bold text-foreground leading-tight">
                      {store?.name}
                    </h1>
                    {store?.product_count > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {store.product_count} productos
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Breadcrumb items={breadcrumb} />

          {/* Semantic search banner */}
          {semanticClass && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-semantic/8 border border-semantic/25
                            rounded-xl fade-up">
              <div className="w-7 h-7 rounded-lg bg-semantic/15 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-semantic" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  Búsqueda semántica:&nbsp;
                  <span className="text-semantic">{semanticClass}</span>
                </p>
                {semanticMatchCount > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {semanticMatchCount} coincidencias exactas destacadas al inicio
                  </p>
                )}
              </div>
              <button
                onClick={clearSemantic}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground
                           hover:text-foreground hover:bg-secondary rounded-lg transition-colors shrink-0"
              >
                <X size={12} />
                Limpiar
              </button>
            </div>
          )}

          <div className="mt-5 flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-60 xl:w-64 flex-shrink-0">
              <FilterPanel
                filters={ontologyFilters}
                activeFilters={activeFilters}
                onChange={setActiveFilters}
              />
            </div>

            {/* Products area */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  {productsLoading
                    ? <span className="inline-block h-4 w-36 shimmer rounded" />
                    : (
                      <>
                        Mostrando{' '}
                        <strong className="text-foreground">{finalProducts.length}</strong>
                        {' '}productos
                        {semanticMatchCount > 0 && semanticMatchCount < finalProducts.length && (
                          <span className="ml-1 text-semantic">
                            ({semanticMatchCount} semánticos)
                          </span>
                        )}
                      </>
                    )
                  }
                </p>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-muted-foreground flex-shrink-0" />
                  <select
                    value={ordering}
                    onChange={e => setOrdering(e.target.value)}
                    className="text-xs bg-card border border-border rounded-lg px-2.5 py-1.5
                               text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50
                               focus:border-primary/50 transition cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid */}
              {productsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              )}

              {!productsLoading && finalProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <LayoutGrid size={24} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Sin productos</p>
                  <p className="text-xs text-muted-foreground">Prueba ajustando los filtros</p>
                  {(semanticClass || Object.keys(activeFilters).some(k => activeFilters[k])) && (
                    <button
                      onClick={() => { clearSemantic(); setActiveFilters({}) }}
                      className="mt-3 text-xs text-primary hover:underline"
                    >
                      Limpiar todos los filtros
                    </button>
                  )}
                </div>
              )}

              {!productsLoading && finalProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {finalProducts.map((product, idx) => {
                    const isSemantic = semanticIds?.has(String(product.id))
                    const isFirstNonSemantic = semanticIds && !isSemantic &&
                      idx > 0 && semanticIds.has(String(finalProducts[idx - 1].id))

                    return (
                      <div key={product.id} className="relative">
                        {/* Divider between semantic and regular results */}
                        {isFirstNonSemantic && (
                          <div className="absolute -top-2.5 left-0 right-0 flex items-center gap-2
                                          col-span-full -mx-1 pointer-events-none">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-[10px] text-muted-foreground px-2 shrink-0">
                              Otros productos
                            </span>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}

                        {/* Semantic match ring */}
                        {isSemantic && (
                          <div className="absolute -inset-px rounded-2xl border-2 border-semantic/30
                                          pointer-events-none z-10" />
                        )}

                        <ProductCard product={product} storeSlug={slug} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
