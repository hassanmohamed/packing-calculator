import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'
import { Languages, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { t, i18n } = useTranslation()
  const { user, signIn, signUp, isConfigured } = useAuth()
  const location = useLocation()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to dashboard
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        setError(isSignUp ? t('auth.signupError') : t('auth.loginError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -start-40 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl"></div>
      </div>

      {/* Language toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 end-4 text-white hover:bg-white/10"
        onClick={toggleLanguage}
      >
        <Languages className="h-5 w-5" />
      </Button>

      <Card className="relative w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
            <img 
              src="/logo-full.png" 
              alt="Ramadan Bag" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">{t('app.name')}</CardTitle>
          <CardDescription className="text-slate-300">{t('app.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigured && (
            <div className="mb-4 rounded-lg bg-amber-500/20 p-4 text-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Supabase Not Configured</span>
              </div>
              <p className="text-sm text-amber-300">
                Please create a <code className="bg-amber-500/20 px-1 rounded">.env</code> file with your Supabase credentials:
              </p>
              <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key`}
              </pre>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  {t('auth.confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                />
              </div>
            )}
            
            {error && (
              <div className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {loading ? t('common.loading') : isSignUp ? t('auth.signup') : t('auth.login')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
