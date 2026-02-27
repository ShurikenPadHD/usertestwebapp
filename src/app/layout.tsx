import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UserTest - Authentic Usability Testing',
  description: 'Get screen recordings of real people using your app with live voice narration. Discover UX issues before you ship.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-white antialiased">{children}</body>
    </html>
  )
}
