import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Calculator, ArrowRight, TrendingUp, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageNavigation } from '@/components/layout/PageNavigation'
import { useProductTour } from '@/components/ProductTour'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBagStore } from '@/hooks/useBagStore'
import { formatCurrency } from '@/lib/utils'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { getCostPerBag, currentBag } = useBagStore()
  const { resetAndStartTour } = useProductTour()
  const [stats, setStats] = useState({
    totalItems: 0,
    savedBags: 0,
  })
  const [loading, setLoading] = useState(true)

  const isRtl = i18n.language === 'ar'

  useEffect(() => {
    async function fetchStats() {
      if (!user) return
      
      try {
        const [itemsResult, bagsResult] = await Promise.all([
          supabase.from('items').select('id', { count: 'exact', head: true }),
          supabase.from('bag_templates').select('id', { count: 'exact', head: true }),
        ])
        
        setStats({
          totalItems: itemsResult.count || 0,
          savedBags: bagsResult.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const statCards = [
    {
      title: t('dashboard.stats.totalItems'),
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('dashboard.stats.savedBags'),
      value: stats.savedBags,
      icon: ShoppingBag,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: t('dashboard.stats.avgCostPerBag'),
      value: formatCurrency(getCostPerBag()),
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ]

  const quickActions = [
    { to: '/pantry', icon: Package, label: t('nav.pantry'), color: 'bg-blue-500' },
    { to: '/calculator', icon: Calculator, label: t('nav.calculator'), color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-8 page-transition">
      {/* Header */}
      <div className="animate-slide-up flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetAndStartTour}
          className="gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          {t('tour.startTour')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className={`overflow-hidden card-hover animate-slide-up stagger-${index + 1}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`rounded-full bg-gradient-to-br ${stat.gradient} p-3 transition-transform hover:scale-110`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="animate-slide-up stagger-4">
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <div className="group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className={`${action.color} rounded-lg p-2`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className={`h-5 w-5 text-muted-foreground transition-transform group-hover:text-primary ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Bag Preview */}
      {currentBag.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('calculator.bagContents')}</CardTitle>
            <CardDescription>
              {currentBag.length} {t('common.total')} • {formatCurrency(getCostPerBag())} {t('calculator.perBag')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentBag.slice(0, 5).map((item) => (
                <div
                  key={item.item.id}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {i18n.language === 'ar' ? item.item.name_ar : item.item.name_en}
                </div>
              ))}
              {currentBag.length > 5 && (
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  +{currentBag.length - 5}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link to="/calculator">
                <Button variant="outline" className="w-full">
                  {t('calculator.title')}
                  <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180 me-2' : 'ms-2'}`} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Navigation */}
      <PageNavigation 
        nextPath="/pantry" 
        nextLabel={t('nav.pantry')} 
      />
    </div>
  )
}
