'use client'
import { useState } from 'react'
import LeftPanel from './components/LeftPanel'
import ChatPanel from './components/ChatPanel'
import ProfilePanel from './components/ProfilePanel'
import AuthGuard from './components/AuthGuard'

export default function HomePage() {
  const [activeFriend, setActiveFriend] = useState<any>(null)
  const [activeProfile, setActiveProfile] = useState<any>(null)
  const [view, setView] = useState<'friends' | 'chat' | 'profile'>('friends')

  function handleSelectFriend(friend: any) {
    setActiveFriend(friend)
    setActiveProfile(null)
    setView('chat')
  }

  function handleOpenProfile(friend: any) {
    setActiveProfile(friend)
    setView('profile')
  }

  return (
    <AuthGuard>
      <div className="h-screen flex bg-gray-100">
        {view === 'friends' && (
          <div className="flex-1 bg-white">
            <LeftPanel
              onSelectFriend={handleSelectFriend}
              onOpenProfile={handleOpenProfile}
            />
          </div>
        )}

        {view === 'chat' && activeFriend && (
          <div className="flex-1 bg-white">
            <ChatPanel
              selectedFriend={activeFriend}
              onOpenProfile={handleOpenProfile}
            />
            <button
              className="absolute top-4 left-4 bg-gray-200 text-sm px-3 py-1 rounded-md"
              onClick={() => setView('friends')}
            >
              ← Kembali
            </button>
          </div>
        )}

        {view === 'profile' && activeProfile && (
          <div className="flex-1 bg-white">
            <ProfilePanel
              selectedUser={activeProfile}
              onClose={() => setView('chat')}
            />
            <button
              className="absolute top-4 left-4 bg-gray-200 text-sm px-3 py-1 rounded-md"
              onClick={() => setView('chat')}
            >
              ← Kembali
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
