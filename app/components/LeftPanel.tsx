'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LeftPanel({
  onSelectFriend,
  onOpenProfile
}: {
  onSelectFriend: (f: any) => void
  onOpenProfile: (f: any) => void
}) {
  const [friends, setFriends] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    fetchUserAndFriends()
  }, [])

  async function fetchUserAndFriends() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    setUser(userData.user)

    // ✅ Ambil profil user login dari tabel profiles
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userData.user.id)
      .single()

    if (myProfile) setUserProfile(myProfile)

    // ✅ Ambil daftar teman
    const { data: friendData } = await supabase
      .from('friends')
      .select('*')
      .or(
        `requester_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`
      )
      .eq('status', 'accepted')

    const friendIds =
      friendData?.map((f) =>
        f.requester_id === userData.user.id ? f.receiver_id : f.requester_id
      ) || []

    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', friendIds)

      setFriends(friendProfiles || [])
    }
  }

  async function searchUser() {
    if (!search) return
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${search}%`)
    setSearchResult(data || [])
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="h-full bg-white p-3 flex flex-col">
      {/* Search */}
      <div className="flex mb-3">
        <input
          type="text"
          placeholder="Cari username..."
          className="flex-1 p-2 border rounded-l-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={searchUser}
          className="bg-red-500 text-white px-3 rounded-r-md"
        >
          Cari
        </button>
      </div>

      {/* Teman */}
      <div className="overflow-y-auto flex-1">
        <h3 className="font-bold text-sm mb-1">Teman</h3>
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="cursor-pointer flex items-center justify-between p-2 hover:bg-red-100 rounded-md"
            onClick={() => onSelectFriend(friend)}
          >
            <div className="flex items-center">
              <img
                src={friend.avatar_url || '/default.jpg'}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{friend.username}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenProfile(friend)
              }}
              className="text-xs text-blue-500 underline"
            >
              Profil
            </button>
          </div>
        ))}
      </div>

      {/* User Info + Logout */}
      {userProfile && (
        <div className="mt-3 border-t pt-3 flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onOpenProfile(userProfile)}
          >
            <img
              src={userProfile.avatar_url || '/default.jpg'}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm">{userProfile.username}</span>
          </div>
          <button onClick={logout} className="text-xs text-red-500 underline">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
