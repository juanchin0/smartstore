import { Link } from 'react-router-dom'
import { Sparkles, Mail, Shield, FileText, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles size={14} className="text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">
                Smart<span className="text-primary">Store</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comercio electrónico potenciado por inteligencia semántica.
              Encuentra lo que buscas, incluso si no sabes cómo pedirlo.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">
              Plataforma
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Tiendas', to: '/' },
                { label: 'Cómo funciona la IA', to: '/' },
                { label: 'Para vendedores', to: '/' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">
              Contacto
            </p>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hola@smartstore.mx"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail size={14} />
                  hola@smartstore.mx
                </a>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Shield size={14} />
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <FileText size={14} />
                  Términos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SmartStore. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Impulsado por
            <span className="text-semantic font-medium">IA semántica OWL</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
