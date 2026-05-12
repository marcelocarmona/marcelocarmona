'use client'

import { useResolvedLocale } from '@/lib/i18n/resolve'
import siteMetadata from '@/data/siteMetadata'
import Logo from '@/data/logo.svg'
import { getHomePath } from '@/lib/i18n/routes'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import HeaderNav from './HeaderNav'
import ThemeSwitch from './ThemeSwitch'
import type { Locale } from '@/types/content'
import type { ReactNode } from 'react'

const LayoutWrapper = ({
  children,
  postLocaleMap,
}: {
  children: ReactNode
  postLocaleMap?: Record<string, Locale>
}) => {
  const locale = useResolvedLocale(postLocaleMap)

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href={getHomePath(locale)} aria-label={siteMetadata.headerTitle}>
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  <Logo />
                </div>
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="display-title h-6 whitespace-nowrap text-xl font-semibold sm:block sm:text-2xl">
                    {siteMetadata.headerTitle}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center text-base leading-5">
            <div className="hidden sm:block">
              <HeaderNav locale={locale} />
            </div>
            <ThemeSwitch />
            <MobileNav locale={locale} />
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer locale={locale} />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
