import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageNavigationProps {
  previousPath?: string
  previousLabel?: string
  nextPath?: string
  nextLabel?: string
}

export function PageNavigation({ 
  previousPath, 
  previousLabel, 
  nextPath, 
  nextLabel 
}: PageNavigationProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // If no navigation needed, don't render
  if (!previousPath && !nextPath) return null

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      {/* Previous Button */}
      <div>
        {previousPath ? (
          <Button 
            variant="outline" 
            onClick={() => navigate(previousPath)}
            className="gap-2"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span>{previousLabel || t('common.previous')}</span>
          </Button>
        ) : (
          <div /> // Placeholder for layout
        )}
      </div>

      {/* Next Button */}
      <div>
        {nextPath ? (
          <Button 
            onClick={() => navigate(nextPath)}
            className="gap-2"
          >
            <span>{nextLabel || t('common.next')}</span>
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div /> // Placeholder for layout
        )}
      </div>
    </div>
  )
}
