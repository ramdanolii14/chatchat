'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
      } else {
        setIsChecked(true)
      }
    }
    checkAuth()
  }, [router])

  if (!isChecked) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>🔄 Checking auth...</p>
      </div>
    )
  }

  return <>{children}</>
}
