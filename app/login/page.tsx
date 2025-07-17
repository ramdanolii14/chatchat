'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) return alert('Login gagal: ' + error.message)
    router.push('/')
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center text-red-500">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="p-2 border w-full rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border w-full rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-red-500 text-white w-full p-2 rounded-md"
        >
          Masuk
        </button>
        <p className="text-sm mt-3 text-center">
          Belum punya akun?{' '}
          <a href="/register" className="text-blue-500 underline">
            Daftar
          </a>
        </p>
      </div>
    </div>
  )
}
