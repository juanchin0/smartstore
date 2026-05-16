import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'

const ToastContext = createContext()

const ICONS = {
  success: <CheckCircle size={15} className="text-success" />,
  error: <AlertCircle size={15} className="text-destructive" />,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, { type = 'success', duration = 3000, action } = {}) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, message, type, action }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom-right */}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3
                       bg-card border border-border rounded-2xl shadow-2xl fade-up
                       min-w-[260px] max-w-sm"
          >
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
              t.type === 'error' ? 'bg-destructive/10' : 'bg-success/10'
            )}>
              {ICONS[t.type] ?? ICONS.success}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{t.message}</p>
              {t.action && (
                <button
                  onClick={() => { t.action.onClick(); dismiss(t.id) }}
                  className="text-xs text-primary font-medium hover:underline mt-1"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
