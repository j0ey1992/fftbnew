import './globals.css'
import type { Metadata } from 'next'
import { QueryClientProvider } from '@/components/providers/QueryClientProvider'
import { AuthProvider } from '@/components/providers/auth'
import { HeadScripts } from './head-scripts'
import { ViewportHeightFix } from '@/app/viewport-fix'

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
      <body className="font-sans antialiased">
        <QueryClientProvider>
          <AuthProvider>
            {children}
            <ViewportHeightFix />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
