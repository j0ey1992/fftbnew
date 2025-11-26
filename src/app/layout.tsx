import './globals.css'
import '@/lib/reown/init' // Import AppKit initialization
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReownProvider } from '@/components/providers/ReownProvider'
import { AppKitProvider } from '@/components/providers/AppKitProvider'
import { QueryClientProvider } from '@/components/providers/QueryClientProvider'
import { AuthProvider } from '@/components/providers/auth'
import ReownClient from './reown-client'
import { HeadScripts } from './head-scripts'
import { ViewportHeightFix } from '@/app/viewport-fix'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'FFTB | Fortune Favors The Brave',
  description: 'Community-driven token on Cronos focused on growing Cronos awareness and bridging Crypto.com users into the Cronos ecosystem',
  keywords: 'FFTB, Fortune Favors The Brave, Cronos, CRO, crypto, blockchain, Crypto.com, zkEVM',
  authors: [{ name: 'FFTB Community' }],
  openGraph: {
    title: 'FFTB | Fortune Favors The Brave',
    description: 'Community-driven token on Cronos focused on growing Cronos awareness and bridging Crypto.com users into the Cronos ecosystem',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <HeadScripts />
      </head>
      <body className={inter.className}>
        <QueryClientProvider>
          <ReownProvider>
            <AppKitProvider>
              <AuthProvider>
                {children}
                <ReownClient />
                <ViewportHeightFix />
              </AuthProvider>
            </AppKitProvider>
          </ReownProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
