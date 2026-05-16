import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../lib/utils'

function Section({ label, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {label}
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

export default function FilterPanel({ filters = {}, activeFilters = {}, onChange, className }) {
  const hasActive = Object.keys(activeFilters).some(k => {
    const v = activeFilters[k]
    return v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
  })

  const set = (key, value) => onChange({ ...activeFilters, [key]: value })

  const clear = () => {
    const cleared = {}
    Object.keys(activeFilters).forEach(k => { cleared[k] = '' })
    onChange(cleared)
  }

  return (
    <aside className={cn('bg-card border border-border rounded-2xl p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal size={15} className="text-primary" />
          Filtros
        </span>
        {hasActive && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>

      {/* Fixed: Price range */}
      <Section label="Precio">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">Mín.</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={activeFilters.price_min ?? ''}
              onChange={e => set('price_min', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground/50 focus:outline-none
                         focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition"
            />
          </div>
          <span className="text-muted-foreground text-xs mt-4">—</span>
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">Máx.</label>
            <input
              type="number"
              min={0}
              placeholder="∞"
              value={activeFilters.price_max ?? ''}
              onChange={e => set('price_max', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg
                         text-foreground placeholder:text-muted-foreground/50 focus:outline-none
                         focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition"
            />
          </div>
        </div>
      </Section>

      {/* Fixed: Rating */}
      <Section label="Valoración mínima">
        <div className="flex gap-1.5 flex-wrap">
          {[0, 3, 3.5, 4, 4.5].map(v => (
            <button
              key={v}
              onClick={() => set('rating_min', v === 0 ? '' : v)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg border transition-colors',
                (activeFilters.rating_min ?? '') == v || (v === 0 && !activeFilters.rating_min)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              {v === 0 ? 'Todas' : `★ ${v}+`}
            </button>
          ))}
        </div>
      </Section>

      {/* Fixed: Discount */}
      <Section label="Descuentos" defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => set('has_discount', activeFilters.has_discount ? '' : 'true')}
            className={cn(
              'w-8 h-4.5 rounded-full transition-colors relative flex-shrink-0',
              activeFilters.has_discount ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform',
              activeFilters.has_discount ? 'translate-x-4' : 'translate-x-0.5'
            )} />
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Solo productos en oferta
          </span>
        </label>
      </Section>

      {/* Dynamic ontology filters */}
      {Object.entries(filters).map(([key, meta]) => {
        const { label, type, values = [] } = meta

        if (type === 'select' && values.length > 0) {
          const active = activeFilters[key] ?? []
          const activeArr = Array.isArray(active) ? active : (active ? [active] : [])

          const toggle = (val) => {
            const next = activeArr.includes(val)
              ? activeArr.filter(v => v !== val)
              : [...activeArr, val]
            set(key, next)
          }

          return (
            <Section key={key} label={label} defaultOpen={values.length <= 6}>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {values.map(val => (
                  <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggle(val)}
                      className={cn(
                        'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                        activeArr.includes(val)
                          ? 'bg-primary border-primary'
                          : 'border-border group-hover:border-primary/50'
                      )}
                    >
                      {activeArr.includes(val) && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                      {val}
                    </span>
                  </label>
                ))}
              </div>
            </Section>
          )
        }

        if (type === 'range') {
          return (
            <Section key={key} label={label} defaultOpen={false}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín."
                  value={activeFilters[`${key}_min`] ?? ''}
                  onChange={e => set(`${key}_min`, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg
                             text-foreground placeholder:text-muted-foreground/50 focus:outline-none
                             focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition"
                />
                <span className="text-muted-foreground text-xs">—</span>
                <input
                  type="number"
                  placeholder="Máx."
                  value={activeFilters[`${key}_max`] ?? ''}
                  onChange={e => set(`${key}_max`, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg
                             text-foreground placeholder:text-muted-foreground/50 focus:outline-none
                             focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition"
                />
              </div>
            </Section>
          )
        }

        if (type === 'boolean') {
          return (
            <Section key={key} label={label} defaultOpen={false}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => set(key, activeFilters[key] ? '' : 'true')}
                  className={cn(
                    'w-8 rounded-full transition-colors relative flex-shrink-0',
                    activeFilters[key] ? 'bg-primary' : 'bg-muted'
                  )}
                  style={{ height: '18px' }}
                >
                  <span className={cn(
                    'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform',
                    activeFilters[key] ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </span>
              </label>
            </Section>
          )
        }

        return null
      })}
    </aside>
  )
}
