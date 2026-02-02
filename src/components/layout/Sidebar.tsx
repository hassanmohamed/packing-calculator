import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Calculator, 
  ShoppingCart,
  LogOut,
  Languages,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const { signOut } = useAuth()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
  }

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/pantry', icon: Package, label: t('nav.pantry') },
    { to: '/calculator', icon: Calculator, label: t('nav.calculator') },
    { to: '/procurement', icon: ShoppingCart, label: t('nav.procurement') },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed start-0 top-0 z-50 h-screen w-64 border-e bg-card transition-transform duration-300",
          // Mobile: slide in/out
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0 rtl:lg:-translate-x-0"
        )}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
          {/* Header with close button on mobile */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <NavLink to="/" onClick={onClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img 
                  src="/logo-full.png" 
                  alt="Charity Bag" 
                  className="h-10 w-auto object-contain"
                />
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* App name */}
            <NavLink to="/" onClick={onClose} className="block mb-6 px-2 hover:opacity-80 transition-opacity">
              <h1 className="text-lg font-bold text-foreground">{t('app.name')}</h1>
              <p className="text-xs text-muted-foreground">{t('app.description')}</p>
            </NavLink>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom actions */}
          <div className="space-y-2 border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={toggleLanguage}
            >
              <Languages className="h-5 w-5" />
              {i18n.language === 'ar' ? t('language.en') : t('language.ar')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Mobile header component
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation()
  
  return (
    <header className="fixed top-0 start-0 end-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <img 
          src="/logo-full.png" 
          alt="Charity Bag" 
          className="h-8 w-auto object-contain"
        />
        <span className="font-semibold text-foreground">{t('app.name')}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  )
}
