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

  const handleClick = () => navigate(`/tienda/${store.slug}`)

  return (
    <article
      onClick={handleClick}
      className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer card-hover"
    >
      {/* Logo / banner */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-secondary via-muted to-secondary
                      flex items-center justify-center">
        {store.banner && (
          <img
            src={store.banner}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        {store.logo ? (
          <img
            src={store.logo}
            alt={store.name}
            className="relative z-10 max-h-20 max-w-[70%] object-contain drop-shadow-sm
                       transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
              <Package size={28} className="text-primary" />
            </div>
            <span className="text-xl font-display font-bold text-primary/30 mt-1 select-none">
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
