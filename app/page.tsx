'use client'
import { useState } from 'react'
import LeftPanel from './components/LeftPanel'
import ChatPanel from './components/ChatPanel'
import ProfilePanel from './components/ProfilePanel'
import AuthGuard from './components/AuthGuard'

export default function HomePage() {
  const [activeFriend, setActiveFriend] = useState<any>(null)
  const [activeProfile, setActiveProfile] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)

  function handleSelectFriend(friend: any) {
    setActiveFriend(friend)
    setActiveProfile(null)
    setShowProfile(false)
  }

  function handleOpenProfile(friend: any) {
    setActiveProfile(friend)
    setShowProfile(true)
  }

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col md:flex-row bg-gray-100">
        <div className="w-full md:w-1/4 border-r bg-white h-1/3 md:h-full">
          <LeftPanel
            onSelectFriend={handleSelectFriend}
            onOpenProfile={handleOpenProfile}
          />
        </div>
        <div className="flex-1 border-r bg-white h-1/3 md:h-full">
          {activeFriend ? (
            <ChatPanel
              selectedFriend={activeFriend}
              onOpenProfile={handleOpenProfile}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm md:text-base">
              Pilih teman untuk mulai chat
            </div>
          )}
        </div>
        <div className="w-full md:w-1/4 bg-white h-1/3 md:h-full">
          {showProfile && activeProfile ? (
            <ProfilePanel
              selectedUser={activeProfile}
              onClose={() => setShowProfile(false)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs md:text-sm">
              Pilih teman lalu klik "Profil"
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
