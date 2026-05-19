import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'

const CATEGORY_COLORS = [
  'bg-primary/10 text-primary',
  'bg-semantic/10 text-semantic',
  'bg-success/10 text-success',
  'bg-sale/10 text-sale-foreground',
]

export default function StoreCard({ store }) {
  const navigate = useNavigate()
  const [logoError, setLogoError] = useState(false)
  const [bannerError, setBannerError] = useState(false)

  const handleClick = () => navigate(`/tienda/${store.slug}`)

  const showBanner = store.banner && !bannerError
  const showLogo = store.logo && !logoError

  return (
    <article
      onClick={handleClick}
      className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer card-hover"
    >
      {/* Banner + Logo */}
      <div className={`relative h-40 overflow-hidden flex items-center justify-center
                       ${showBanner ? 'bg-black' : 'bg-gradient-to-br from-secondary via-muted to-secondary'}`}>
        {showBanner && (
          <img
            src={store.banner}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105
                       transition-transform duration-700 group-hover:scale-110"
            onError={() => setBannerError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {showLogo ? (
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/95 border border-white/20
                          flex items-center justify-center shadow-xl overflow-hidden
                          transition-transform duration-500 group-hover:scale-105">
            <img
              src={store.logo}
              alt={store.name}
              className="w-full h-full object-cover"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20
                            flex items-center justify-center shadow-sm">
              <Package size={30} className="text-primary" />
            </div>
            <span className="text-sm font-display font-bold text-white/60 select-none
                             bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {store.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Product count badge */}
        {store.product_count > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-card/90 backdrop-blur-sm
                          border border-border rounded-full text-[11px] font-data text-muted-foreground">
            {store.product_count} productos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-base text-foreground mb-1.5 line-clamp-1">
          {store.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.625rem] leading-relaxed">
          {store.description || 'Explora nuestra selección de productos.'}
        </p>

        {/* Category badges */}
        <div className="flex flex-wrap gap-1.5 mb-4 min-h-[1.75rem]">
          {(store.categories || []).slice(0, 3).map((cat, i) => (
            <span
              key={cat}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full
                          ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                     bg-primary text-primary-foreground rounded-xl text-sm font-medium
                     transition-all duration-200 hover:bg-primary/90
                     group-hover:gap-3"
          onClick={handleClick}
        >
          Visitar Tienda
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}
