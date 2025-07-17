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
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    fetchUserAndFriends()
  }, [])

  async function fetchUserAndFriends() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // ✅ Ambil profil user login
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userData.user.id)
      .single()
    setUserProfile(myProfile)

    // ✅ Ambil teman yang sudah diterima
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

    // ✅ Ambil permintaan pertemanan pending
    const { data: pendingData } = await supabase
      .from('friends')
      .select('id, requester_id')
      .eq('receiver_id', userData.user.id)
      .eq('status', 'pending')

    if (pendingData?.length) {
      const requesterIds = pendingData.map((r) => r.requester_id)
      const { data: requesterProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', requesterIds)
      setPendingRequests(requesterProfiles || [])
    }
  }

  async function searchUser() {
    if (!search.trim()) return
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${search}%`)
    setSearchResult(data || [])
  }

  async function acceptFriendRequest(friendId: string) {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('requester_id', friendId)
      .eq('receiver_id', userProfile.id)
    if (!error) {
      alert('Permintaan diterima!')
      fetchUserAndFriends()
    }
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

      {/* Hasil pencarian */}
      {searchResult.length > 0 && (
        <div className="mb-3">
          <h3 className="font-bold text-sm mb-1">Hasil Pencarian</h3>
          {searchResult.map((user) => (
            <div
              key={user.id}
              className="cursor-pointer flex items-center justify-between p-2 hover:bg-red-100 rounded-md"
              onClick={() => onSelectFriend(user)}
            >
              <div className="flex items-center">
                <img
                  src={user.avatar_url || '/default.jpg'}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permintaan pertemanan */}
      {pendingRequests.length > 0 && (
        <div className="mb-3">
          <h3 className="font-bold text-sm mb-1">Permintaan Pertemanan</h3>
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-2 bg-yellow-50 rounded-md mb-1"
            >
              <div className="flex items-center">
                <img
                  src={req.avatar_url || '/default.jpg'}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{req.username}</span>
              </div>
              <button
                onClick={() => acceptFriendRequest(req.id)}
                className="text-xs text-green-600 underline"
              >
                Terima
              </button>
            </div>
          ))}
        </div>
      )}

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
