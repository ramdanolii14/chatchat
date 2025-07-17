'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: any) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      alert('Error: ' + error.message)
    } else if (data.user) {
      // ✅ Simpan ke tabel profiles setelah signup berhasil
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: username,
        avatar_url: '',
        bio: ''
      })
      alert('Pendaftaran berhasil! Silakan login.')
      window.location.href = '/login'
    }
    setLoading(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-md shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Daftar</h2>
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
        <p className="text-sm text-center mt-3">
          Sudah punya akun?{' '}
          <a href="/login" className="text-blue-500 underline">
            Login di sini
          </a>
        </p>
      </div>
    </div>
  )
}
