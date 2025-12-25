import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The Warehouse Dealers | Premier Warehouse & Industrial Properties',
    template: '%s | The Warehouse Dealers',
  },
  description: 'Your trusted partner for warehouse and industrial real estate in Southern California. Discover premium distribution centers, manufacturing facilities, and logistics properties.',
  keywords: ['warehouse', 'industrial real estate', 'distribution center', 'logistics', 'commercial property', 'industrial property', 'warehouse lease', 'warehouse sale', 'Chino CA', 'Southern California'],
  authors: [{ name: 'The Warehouse Dealers' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'The Warehouse Dealers',
    title: 'The Warehouse Dealers | Premier Warehouse & Industrial Properties',
    description: 'Your trusted partner for warehouse and industrial real estate in Southern California.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Warehouse Dealers',
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
