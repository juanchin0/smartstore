import { Star, StarHalf } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function RatingStars({ rating = 0, count, size = 14, className }) {
  const full  = Math.floor(rating)
  const half  = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={size} className="fill-sale text-sale" />
        ))}
        {half && <StarHalf size={size} className="fill-sale text-sale" />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} size={size} className="fill-muted text-muted-foreground/30" />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground font-data">
          ({count})
        </span>
      )}
    </div>
  )
}
