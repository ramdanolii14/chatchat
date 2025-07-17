import './globals.css'

export const metadata = {
  title: 'ChatChat - By Ramdan',
  description: 'Chat with others with anonymouse style, we do not take any of your personal data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="h-full">{children}</body>
    </html>
  )
}
