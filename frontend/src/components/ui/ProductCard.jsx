import { ShoppingBag, Eye, ShoppingCart, Sparkles, Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import RatingStars from './RatingStars'
import { formatPrice } from '../../lib/utils'

export default function ProductCard({ product, storeSlug }) {
  const { addToCart, items } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [justAdded, setJustAdded] = useState(false)

  const inCart = items.some(i => i.product_id === product.id)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
    toast(
      inCart
        ? `+1 ${product.name.slice(0, 30)}…`
        : `${product.name.slice(0, 35)}… añadido`,
      {
        action: {
          label: 'Ver carrito',
          onClick: () => navigate('/carrito'),
        },
      }
    )
  }

  const handleDetail = (e) => {
    e.stopPropagation()
    if (storeSlug) navigate(`/tienda/${storeSlug}/producto/${product.id}`)
  }

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-hidden card-hover flex flex-col">

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={40} className="text-muted-foreground/20" />
          </div>
        )}

        {/* Discount ribbon */}
        {product.discount_percent && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-sale text-sale-foreground
                          text-xs font-bold rounded-lg font-data shadow-sm">
            -{product.discount_percent}%
          </div>
        )}

        {/* In-cart badge */}
        {inCart && !justAdded && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-success
                          flex items-center justify-center shadow-sm">
            <Check size={11} className="text-success-foreground" />
          </div>
        )}

        {/* Semantic tags overlay */}
        {product.semantic_tags?.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-wrap gap-1
                          bg-gradient-to-t from-black/50 to-transparent">
            {product.semantic_tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5
                           bg-semantic/80 text-semantic-foreground text-[10px]
                           font-medium rounded-full backdrop-blur-sm"
              >
                <Sparkles size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1.5 leading-snug flex-1">
          {product.name}
        </h3>

        <RatingStars
          rating={Number(product.rating)}
          count={product.rating_count}
          size={13}
          className="mb-2"
        />

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-semibold font-data text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <span className="text-sm line-through text-muted-foreground font-data">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3
                       rounded-lg text-xs font-medium transition-all active:scale-95
                       ${justAdded
                         ? 'bg-success text-success-foreground'
                         : 'bg-primary text-primary-foreground hover:bg-primary/90'
                       }`}
          >
            {justAdded
              ? <><Check size={13} /> Añadido</>
              : <><ShoppingCart size={13} /> {inCart ? 'Añadir más' : 'Añadir'}</>
            }
          </button>
          <button
            onClick={handleDetail}
            className="py-2 px-3 border border-border text-foreground rounded-lg text-xs font-medium
                       transition-colors hover:bg-secondary hover:border-primary/30 active:scale-95 flex items-center"
          >
            <Eye size={13} />
          </button>
        </div>
      </div>
    </article>
  )
}
