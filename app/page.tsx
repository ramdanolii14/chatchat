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

  const [mobileView, setMobileView] = useState<'left' | 'chat' | 'profile'>('left')

  function handleSelectFriend(friend: any) {
    setActiveFriend(friend)
    setActiveProfile(null)
    setShowProfile(false)
    if (window.innerWidth < 768) setMobileView('chat') // mobile: pindah ke chat
  }

  function handleOpenProfile(friend: any) {
    setActiveProfile(friend)
    setShowProfile(true)
    if (window.innerWidth < 768) setMobileView('profile') // mobile: pindah ke profile
  }

  function handleBack() {
    if (mobileView === 'profile') {
      setMobileView('chat')
    } else if (mobileView === 'chat') {
      setMobileView('left')
    }
  }

  return (
    <AuthGuard>
      <div className="h-screen flex bg-gray-100">
        {/* ✅ DESKTOP MODE */}
        <div className="hidden md:flex w-full">
          <div className="w-1/4 border-r bg-white">
            <LeftPanel
              onSelectFriend={handleSelectFriend}
              onOpenProfile={handleOpenProfile}
            />
          </div>
          <div className="flex-1 border-r bg-white">
            {activeFriend ? (
              <ChatPanel
                selectedFriend={activeFriend}
                onOpenProfile={handleOpenProfile}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Pilih teman untuk mulai chat
              </div>
            )}
          </div>
          <div className="w-1/4 bg-white">
            {showProfile && activeProfile ? (
              <ProfilePanel
                selectedUser={activeProfile}
                onClose={() => setShowProfile(false)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Pilih teman lalu klik "Profil"
              </div>
            )}
          </div>
        </div>

        {/* ✅ MOBILE MODE */}
        <div className="md:hidden w-full h-full bg-white relative">
          {mobileView === 'left' && (
            <LeftPanel
              onSelectFriend={handleSelectFriend}
              onOpenProfile={handleOpenProfile}
            />
          )}

          {mobileView === 'chat' && activeFriend && (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center">
                <button
                  onClick={handleBack}
                  className="mr-2 text-red-500 text-lg"
                >
                  ⬅
                </button>
                <span className="font-medium">{activeFriend.username}</span>
              </div>
              <ChatPanel
                selectedFriend={activeFriend}
                onOpenProfile={handleOpenProfile}
              />
            </div>
          )}

          {mobileView === 'profile' && activeProfile && (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center">
                <button
                  onClick={handleBack}
                  className="mr-2 text-red-500 text-lg"
                >
                  ⬅
                </button>
                <span className="font-medium">{activeProfile.username}</span>
              </div>
              <ProfilePanel
                selectedUser={activeProfile}
                onClose={() => handleBack()}
              />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
