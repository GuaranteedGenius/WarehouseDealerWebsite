import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Industrial Realty Partners | Premier Warehouse & Industrial Properties',
    template: '%s | Industrial Realty Partners',
  },
  description: 'Your trusted partner for warehouse and industrial real estate. Discover premium distribution centers, manufacturing facilities, and logistics properties.',
  keywords: ['warehouse', 'industrial real estate', 'distribution center', 'logistics', 'commercial property', 'industrial property', 'warehouse lease', 'warehouse sale'],
  authors: [{ name: 'Industrial Realty Partners' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Industrial Realty Partners',
    title: 'Industrial Realty Partners | Premier Warehouse & Industrial Properties',
    description: 'Your trusted partner for warehouse and industrial real estate.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Realty Partners',
    description: 'Premier Warehouse & Industrial Properties',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
