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
  const [requests, setRequests] = useState<any[]>([])
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

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userData.user.id)
      .single()

    if (myProfile) setUserProfile(myProfile)

    const { data: friendData } = await supabase
      .from('friends')
      .select('*')
      .or(
        `requester_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`
      )

    const acceptedIds =
      friendData
        ?.filter(f => f.status === 'accepted')
        .map((f) =>
          f.requester_id === userData.user.id ? f.receiver_id : f.requester_id
        ) || []

    const pendingIds =
      friendData
        ?.filter(
          f =>
            f.status === 'pending' &&
            f.receiver_id === userData.user.id // hanya permintaan yg masuk ke kita
        )
        .map(f => f.requester_id) || []

    if (acceptedIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', acceptedIds)
      setFriends(friendProfiles || [])
    }

    if (pendingIds.length > 0) {
      const { data: requestProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', pendingIds)
      setRequests(requestProfiles || [])
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
      <div className="flex mb-3">
        <input
          type="text"
          placeholder="Cari username..."
          className="flex-1 p-2 border rounded-l-md text-sm sm:text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={searchUser}
          className="bg-red-500 text-white px-3 rounded-r-md text-sm sm:text-base"
        >
          Cari
        </button>
      </div>

      {/* Permintaan Pertemanan */}
      {requests.length > 0 && (
        <div className="mb-3">
          <h3 className="font-bold text-sm mb-1 text-red-500">Permintaan Pertemanan</h3>
          {requests.map(req => (
            <div
              key={req.id}
              className="cursor-pointer flex items-center justify-between p-2 hover:bg-red-100 rounded-md"
              onClick={() => onOpenProfile(req)}
            >
              <div className="flex items-center">
                <img
                  src={req.avatar_url || '/default.jpg'}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-sm">{req.username}</span>
              </div>
              <span className="text-xs text-gray-400">Pending</span>
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
              <span className="text-sm sm:text-base">{friend.username}</span>
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
          <button
            onClick={logout}
            className="text-xs text-red-500 underline"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
