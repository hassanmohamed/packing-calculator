import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

interface ProductTourProps {
  onComplete?: () => void
  autoStart?: boolean
}

export function ProductTour({ onComplete, autoStart = false }: ProductTourProps) {
  const { t, i18n } = useTranslation()
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const introRef = useRef<ReturnType<typeof introJs> | null>(null)

  const isRTL = i18n.language === 'ar'

  useEffect(() => {
    // Check if user has already seen the tour
    const tourSeen = localStorage.getItem('product-tour-completed')
    setHasSeenTour(!!tourSeen)

    if (autoStart && !tourSeen) {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoStart])

  const startTour = () => {
    const intro = introJs()
    introRef.current = intro

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
          position: 'bottom',
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
      buttonClass: 'product-tour-button',
    })

    intro.oncomplete(() => {
      localStorage.setItem('product-tour-completed', 'true')
      setHasSeenTour(true)
      onComplete?.()
    })

    intro.onexit(() => {
      localStorage.setItem('product-tour-completed', 'true')
      setHasSeenTour(true)
    })

    intro.start()
  }

  const resetTour = () => {
    localStorage.removeItem('product-tour-completed')
    setHasSeenTour(false)
    startTour()
  }

  return { startTour, resetTour, hasSeenTour }
}

// Hook for using the tour
export function useProductTour() {
  const tourRef = useRef<{
    startTour: () => void
    resetTour: () => void
    hasSeenTour: boolean
  } | null>(null)

  const setTourRef = (ref: typeof tourRef.current) => {
    tourRef.current = ref
  }

  return {
    startTour: () => tourRef.current?.startTour(),
    resetTour: () => tourRef.current?.resetTour(),
    hasSeenTour: tourRef.current?.hasSeenTour ?? false,
    setTourRef,
  }
}
