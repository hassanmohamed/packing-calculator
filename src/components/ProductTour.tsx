import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

// Hook for using the product tour
export function useProductTour() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const startTour = useCallback(() => {
    const intro = introJs()

    intro.setOptions({
      steps: [
        {
          title: t('tour.welcome.title'),
          intro: t('tour.welcome.description'),
        },
        {
          element: '[data-tour="sidebar"]',
          title: t('tour.sidebar.title'),
          intro: t('tour.sidebar.description'),
          position: isRTL ? 'left' : 'right',
        },
        {
          element: '[data-tour="store"]',
          title: t('tour.store.title'),
          intro: t('tour.store.description'),
          position: isRTL ? 'left' : 'right',
        },
        {
          element: '[data-tour="calculator"]',
          title: t('tour.calculator.title'),
          intro: t('tour.calculator.description'),
          position: isRTL ? 'left' : 'right',
        },
        {
          element: '[data-tour="procurement"]',
          title: t('tour.procurement.title'),
          intro: t('tour.procurement.description'),
          position: isRTL ? 'left' : 'right',
        },
        {
          element: '[data-tour="language"]',
          title: t('tour.language.title'),
          intro: t('tour.language.description'),
          position: 'top',
        },
        {
          title: t('tour.complete.title'),
          intro: t('tour.complete.description'),
        },
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      nextLabel: t('tour.next'),
      prevLabel: t('tour.prev'),
      doneLabel: t('tour.done'),
      skipLabel: t('tour.skip'),
      tooltipClass: 'product-tour-tooltip',
      highlightClass: 'product-tour-highlight',
    })

    intro.oncomplete(() => {
      localStorage.setItem('product-tour-completed', 'true')
    })

    intro.onexit(() => {
      localStorage.setItem('product-tour-completed', 'true')
    })

    intro.start()
  }, [t, isRTL])

  const resetAndStartTour = useCallback(() => {
    localStorage.removeItem('product-tour-completed')
    startTour()
  }, [startTour])

  const hasSeenTour = () => {
    return localStorage.getItem('product-tour-completed') === 'true'
  }

  return { startTour, resetAndStartTour, hasSeenTour }
}
