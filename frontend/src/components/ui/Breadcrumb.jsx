import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={13} className="text-border" />}
              {isLast
                ? <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
                : <Link to={item.href} className="hover:text-foreground transition-colors truncate max-w-[160px]">{item.label}</Link>
              }
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
