import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, ShoppingCart, User, Sun, Moon, Sparkles,
  X, Loader2, ArrowRight, Store, Package, Clock,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useCart } from '../../context/CartContext'
import { semanticSearch, getSearchSuggestions } from '../../api/ontology'
import { cn } from '../../lib/utils'

const RECENT_KEY = 'ss_recent_searches'
const MAX_RECENT = 5

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(q) {
  const next = [q, ...getRecent().filter(r => r !== q)].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}
function removeRecent(q) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(r => r !== q)))
}

function buildSemanticUrl(result) {
  if (!result.products?.length) return null
  const counts = {}
  result.products.forEach(p => {
    if (p.store_slug) counts[p.store_slug] = (counts[p.store_slug] || 0) + 1
  })
  const topStore = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]
  if (!topStore) return null
  const ids = result.products.map(p => p.id).join(',')
  const params = new URLSearchParams()
  if (result.inferred_class) params.set('semantic_class', result.inferred_class)
  if (ids) params.set('products', ids)
  return `/tienda/${topStore}?${params}`
}

export default function Header() {
  const { isDark, toggle } = useTheme()
  const { count } = useCart()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [inference, setInference] = useState(null)

  // Autocomplete state
  const [suggestions, setSuggestions] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [recent, setRecent] = useState(getRecent)

  const inputRef = useRef(null)
  const wrapperRef = useRef(null)
  const navTimerRef = useRef(null)
  const debounceRef = useRef(null)

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Debounced suggestions fetch ─────────────────────────────────────────────
  const fetchSuggestions = useCallback((q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 2) { setSuggestions(null); return }
    debounceRef.current = setTimeout(async () => {
      setIsFetching(true)
      try {
        const data = await getSearchSuggestions(q.trim())
        setSuggestions(data)
      } catch {
        setSuggestions(null)
      } finally {
        setIsFetching(false)
      }
    }, 300)
  }, [])

  const handleQueryChange = (e) => {
    const q = e.target.value
    setQuery(q)
    setInference(null)
    setDropdownOpen(true)
    fetchSuggestions(q)
    if (!q.trim()) setSuggestions(null)
  }

  const handleFocus = () => {
    setDropdownOpen(true)
    if (query.trim().length >= 2) fetchSuggestions(query)
  }

  // ── Semantic search on Enter ────────────────────────────────────────────────
  const handleSearch = async (e, overrideQuery) => {
    e?.preventDefault()
    const q = (overrideQuery ?? query).trim()
    if (!q || isSearching) return
    setDropdownOpen(false)
    saveRecent(q)
    setRecent(getRecent())
    if (navTimerRef.current) clearTimeout(navTimerRef.current)
    setIsSearching(true)
    setInference(null)

    try {
      const result = await semanticSearch({ query: q })
      const navUrl = buildSemanticUrl(result)
      setInference({ ...result, _navUrl: navUrl })

      if (navUrl && result.confidence >= 0.5) {
        navTimerRef.current = setTimeout(() => {
          navigate(navUrl)
          setInference(null)
        }, 1600)
      }
    } catch {
      setInference({ error: true })
    } finally {
      setIsSearching(false)
    }
  }

  const triggerSearch = (q) => {
    setQuery(q)
    setDropdownOpen(false)
    handleSearch(null, q)
  }

  const goNow = () => {
    if (!inference?._navUrl) return
    if (navTimerRef.current) clearTimeout(navTimerRef.current)
    navigate(inference._navUrl)
    setInference(null)
  }

  const clearSearch = () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current)
    setQuery('')
    setSuggestions(null)
    setInference(null)
    setDropdownOpen(false)
    inputRef.current?.focus()
  }

  const dismissInference = (e) => {
    e.stopPropagation()
    if (navTimerRef.current) clearTimeout(navTimerRef.current)
    setInference(null)
  }

  const goToStore = (slug) => {
    setDropdownOpen(false)
    setQuery('')
    setInference(null)
    navigate(`/tienda/${slug}`)
  }

  const goToProduct = (product) => {
    setDropdownOpen(false)
    setQuery('')
    setInference(null)
    navigate(`/tienda/${product.store_slug}/producto/${product.id}`)
  }

  const deleteRecent = (e, q) => {
    e.stopPropagation()
    removeRecent(q)
    setRecent(getRecent())
  }

  const pct = inference?.confidence ? Math.round(inference.confidence * 100) : 0

  const hasStores = suggestions?.stores?.length > 0
  const hasProducts = suggestions?.products?.length > 0
  const hasRecent = recent.length > 0 && !query.trim()
  const showDropdown = dropdownOpen && !inference && (hasStores || hasProducts || hasRecent || isFetching)

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center
                          shadow-sm group-hover:shadow-primary/30 transition-shadow">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">
            Smart<span className="text-primary">Store</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative" ref={wrapperRef}>
          <form onSubmit={handleSearch}>
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border bg-input',
              'transition-all duration-200',
              isSearching
                ? 'border-primary/50 ring-2 ring-primary/20'
                : dropdownOpen
                  ? 'border-primary/40 ring-2 ring-primary/15'
                  : 'border-border hover:border-primary/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20'
            )}>
              {isSearching || isFetching
                ? <Loader2 size={16} className="text-primary shrink-0 animate-spin" />
                : <Search size={16} className="text-muted-foreground shrink-0" />
              }
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={handleFocus}
                placeholder="Busca tiendas, productos o escribe con IA…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button type="button" onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* ── Autocomplete Dropdown ── */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border
                            rounded-xl shadow-xl z-50 overflow-hidden fade-up">

              {/* Recent searches */}
              {hasRecent && (
                <div>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Búsquedas recientes
                  </p>
                  {recent.map(r => (
                    <button
                      key={r}
                      onClick={() => triggerSearch(r)}
                      className="w-full flex items-center justify-between px-3 py-2
                                 hover:bg-secondary transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock size={13} className="text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{r}</span>
                      </div>
                      <button
                        onClick={(e) => deleteRecent(e, r)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground
                                   hover:text-foreground transition-all shrink-0 ml-2"
                      >
                        <X size={12} />
                      </button>
                    </button>
                  ))}
                  {(hasStores || hasProducts) && <div className="mx-3 my-1 h-px bg-border" />}
                </div>
              )}

              {/* Stores */}
              {hasStores && (
                <div>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tiendas
                  </p>
                  {suggestions.stores.map(store => (
                    <button
                      key={store.id}
                      onClick={() => goToStore(store.slug)}
                      className="w-full flex items-center gap-3 px-3 py-2.5
                                 hover:bg-secondary transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted border border-border
                                      flex items-center justify-center shrink-0">
                        {store.logo
                          ? <img src={store.logo} alt="" className="w-full h-full object-contain p-1 rounded-lg" />
                          : <Store size={14} className="text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{store.name}</p>
                        {store.categories?.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {store.categories.slice(0, 3).join(' · ')}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={13} className="text-muted-foreground shrink-0" />
                    </button>
                  ))}
                  {hasProducts && <div className="mx-3 my-1 h-px bg-border" />}
                </div>
              )}

              {/* Products */}
              {hasProducts && (
                <div>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Productos
                  </p>
                  {suggestions.products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => goToProduct(product)}
                      className="w-full flex items-center gap-3 px-3 py-2
                                 hover:bg-secondary transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted border border-border
                                      flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image
                          ? <img src={product.image} alt="" className="w-full h-full object-cover" />
                          : <Package size={14} className="text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate leading-tight">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.store_name ?? ''}{product.price ? ` · $${Number(product.price).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <ArrowRight size={13} className="text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Search with AI CTA */}
              {query.trim().length >= 2 && (
                <div>
                  <div className="mx-3 my-1 h-px bg-border" />
                  <button
                    onClick={() => handleSearch(null, query)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-1
                               hover:bg-semantic/8 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-md bg-semantic/10 flex items-center justify-center shrink-0">
                      <Sparkles size={12} className="text-semantic" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Buscar <span className="font-medium text-foreground">"{query.trim()}"</span> con IA semántica
                    </span>
                    <ArrowRight size={13} className="text-semantic shrink-0 ml-auto" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Semantic inference banner ── */}
          {inference && !inference.error && !dropdownOpen && (
            <div
              onClick={goNow}
              className={cn(
                'absolute top-full left-0 right-0 mt-2 p-3.5 bg-card border rounded-xl',
                'shadow-xl fade-up z-50 transition-colors',
                inference._navUrl
                  ? 'border-semantic/40 cursor-pointer hover:border-semantic/70 hover:bg-semantic/5'
                  : 'border-border cursor-default'
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-semantic/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-semantic" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-foreground">
                      {inference.inferred_class
                        ? `Detectamos: ${inference.inferred_class}`
                        : 'Búsqueda por texto'}
                    </p>
                    {pct > 0 && (
                      <span className="px-1.5 py-0.5 bg-semantic/10 text-semantic text-[10px]
                                       font-bold rounded-md font-data">
                        {pct}%
                      </span>
                    )}
                  </div>

                  {pct > 0 && (
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-semantic rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{inference.count ?? inference.products?.length ?? 0} productos encontrados</span>
                    {inference.matched_tokens?.length > 0 && (
                      <span className="hidden sm:inline">
                        Tokens: {inference.matched_tokens.join(', ')}
                      </span>
                    )}
                    {inference.price_max && (
                      <span className="text-primary font-medium">
                        Hasta ${Number(inference.price_max).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {inference._navUrl && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-semantic font-medium">
                      <ArrowRight size={11} />
                      {inference.confidence >= 0.5
                        ? 'Redirigiendo automáticamente… (o haz clic)'
                        : 'Haz clic para ver resultados'}
                    </div>
                  )}
                </div>

                <button
                  onClick={dismissInference}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {inference?.error && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2.5 bg-destructive/10 border
                            border-destructive/30 rounded-xl text-xs text-destructive fade-up z-50">
              No se pudo conectar con el servicio semántico.
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground
                       hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground
                             hover:text-foreground hover:bg-secondary transition-colors">
            <User size={18} />
          </button>

          <Link
            to="/carrito"
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground
                       hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Ver carrito"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground
                               text-[10px] font-bold rounded-full flex items-center justify-center font-data">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
