import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Calculator, 
  ShoppingCart,
  LogOut,
  Languages
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Sidebar() {
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
    <aside className="fixed start-0 top-0 z-40 h-screen w-64 border-e bg-card transition-transform">
      <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
        {/* Logo */}
        <div>
          <div className="mb-8 flex items-center gap-3 px-2">
            <img 
              src="/logo-full.png" 
              alt="Ramadan Bag" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('app.name')}</h1>
              <p className="text-xs text-muted-foreground">{t('app.description')}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
  )
}
