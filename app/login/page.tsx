'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) return alert('Login gagal: ' + error.message)
    router.push('/')
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) return alert('Login Google gagal: ' + error.message)
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

        {/* Tombol Google di bawah tulisan "Belum punya akun?" */}
        <button
          onClick={handleGoogleLogin}
          className="bg-white border border-gray-300 text-gray-700 w-full p-2 rounded-md mt-4 flex items-center justify-center hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Masuk dengan Google
        </button>
      </div>
    </div>
  )
}
