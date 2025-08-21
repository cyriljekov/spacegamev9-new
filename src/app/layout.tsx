import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Echoes of Earth',
  description: 'A mature text-based survival horror game in the Medusa Galaxy',
  manifest: '/manifest.json',
  themeColor: '#0d0d0d',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-space-black text-white font-mono" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}