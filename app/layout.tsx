import './globals.css'

export const metadata = {
  title: 'Chat App',
  description: 'Simple Supabase Chat',
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
