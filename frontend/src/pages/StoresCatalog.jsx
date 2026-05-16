import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Store, Search } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import StoreCard from '../components/ui/StoreCard'
import { StoreCardSkeleton } from '../components/ui/LoadingGrid'
import { getStores } from '../api/stores'

export default function StoresCatalog() {
  const [search, setSearch] = useState('')

  const { data: stores = [], isLoading, isError } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
  })

  const filtered = search.trim()
    ? stores.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.categories?.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    : stores

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-semantic/5
                            border-b border-border">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-semantic/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary
                            rounded-full text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Búsqueda semántica activa
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
              Descubre las mejores<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-semantic">
                tiendas
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Explora nuestro catálogo y encuentra exactamente lo que buscas con inteligencia semántica.
            </p>

            {/* Local filter search */}
            <div className="relative max-w-md mx-auto">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar tiendas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm
                           text-foreground placeholder:text-muted-foreground/60 focus:outline-none
                           focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store size={15} />
              {isLoading ? (
                <div className="h-4 w-32 shimmer rounded" />
              ) : (
                <span>
                  {filtered.length} tienda{filtered.length !== 1 ? 's' : ''}
                  {search && ` para "${search}"`}
                </span>
              )}
            </div>
          </div>

          {isError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <p className="text-sm text-destructive font-medium">No se pudo cargar el catálogo</p>
              <p className="text-xs text-muted-foreground mt-1">Verifica que el servidor esté activo</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <StoreCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Store size={28} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {search ? `Sin resultados para "${search}"` : 'No hay tiendas disponibles'}
              </p>
              <p className="text-xs text-muted-foreground">
                {search ? 'Intenta con otro término de búsqueda' : 'Vuelve pronto'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
