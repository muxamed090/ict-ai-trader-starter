import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:       'ICT AI Trader v2.0',
  description: 'Nidaamka Ganacsiga Mustaqbalka — 10 Module · 85–90% Win Rate',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="so" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
