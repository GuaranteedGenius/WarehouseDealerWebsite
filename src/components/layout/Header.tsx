'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Properties', href: '/properties' },
  { name: 'About', href: '/#about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="The Warehouse Dealers"
              width={120}
              height={40}
              className="h-12 w-auto rounded-lg"
              priority
            />
            <div>
              <span className="font-display font-bold text-xl text-gray-900">The Warehouse</span>
              <span className="hidden sm:inline font-display font-bold text-xl text-primary-600"> Dealers</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'font-medium transition-colors',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                )}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/properties"
              className="btn-primary btn-sm"
            >
              View Properties
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block py-3 font-medium transition-colors',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                )}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-4 btn-primary text-center"
            >
              View Properties
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
