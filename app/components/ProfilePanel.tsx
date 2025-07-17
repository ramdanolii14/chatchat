'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePanel({
  selectedUser,
  onClose
}: {
  selectedUser: any
  onClose: () => void
}) {
  const [user, setUser] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      setUser(userData.user)
      setIsOwnProfile(selectedUser.id === userData.user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedUser.id)
        .single()

      if (profileData) {
        setUsername(profileData.username || '')
        setBio(profileData.bio || '')
        setAvatar(profileData.avatar_url || '')
      }
    }
    init()
  }, [selectedUser])

  async function updateProfile() {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        avatar_url: avatar
      })
      .eq('id', user.id)
    if (!error) {
      alert('Profil diperbarui!')
      window.location.reload()
    } else console.error(error)
  }

  return (
    <div className="h-full w-full bg-white p-4 flex flex-col">
      <button
        onClick={onClose}
        className="text-red-500 text-sm mb-4 self-end"
      >
        ✕ Tutup
      </button>

      <div className="flex flex-col items-center">
        <img
          src={avatar || '/default.jpg'}
          className="w-24 h-24 rounded-full mb-3 border"
        />
        {isOwnProfile ? (
          <>
            <input
              type="text"
              placeholder="Avatar URL"
              className="p-2 border rounded w-full mb-2"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              className="p-2 border rounded w-full mb-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <textarea
              placeholder="Bio"
              className="p-2 border rounded w-full mb-3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <button
              onClick={updateProfile}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Simpan Perubahan
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">{username}</h2>
            <p className="text-gray-600 text-sm">
              {bio || 'Tidak ada bio.'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
