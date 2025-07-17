import './globals.css'

export const metadata = {
  title: 'Chatchat',
  description: 'Bringing the world with Chatchat.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
