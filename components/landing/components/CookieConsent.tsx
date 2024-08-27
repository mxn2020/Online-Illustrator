import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function CookieConsent({ onAccept }: { onAccept: () => void }) {
    const { t } = useTranslation()
  
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
            {t('cookie_consent.message')}
          </p>
          <Button onClick={onAccept} className="hover:scale-105 transition-transform">{t('cookie_consent.accept')}</Button>
        </div>
      </div>
    )
  }
  
  