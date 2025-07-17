'use client'
import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import LeftPanel from '@/components/LeftPanel'
import ChatPanel from '@/components/ChatPanel'
import ProfilePanel from '@/components/ProfilePanel'

export default function Page() {
  const [activeFriend, setActiveFriend] = useState<any>(null)
  const [activeProfile, setActiveProfile] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)

  // Mobile state
  const [mobileView, setMobileView] = useState<'left' | 'chat' | 'profile'>('left')

  useEffect(() => {
    // ✅ Handle tombol back HP (hanya mobile)
    const handlePopState = () => {
      if (window.innerWidth < 768) {
        if (mobileView === 'chat') setMobileView('left')
        if (mobileView === 'profile') setMobileView('chat')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [mobileView])

  function handleSelectFriend(friend: any) {
    setActiveFriend(friend)
    setActiveProfile(null)
    setShowProfile(false)

    if (window.innerWidth < 768) {
      setMobileView('chat')
      window.history.pushState({ page: 'chat' }, '', '')
    }
  }

  function handleOpenProfile(friend: any) {
    setActiveProfile(friend)
    setShowProfile(true)

    if (window.innerWidth < 768) {
      setMobileView('profile')
      window.history.pushState({ page: 'profile' }, '', '')
    }
  }

  return (
    <AuthGuard>
      <div className="h-screen flex bg-gray-100">
        {/* ✅ DESKTOP MODE (tidak terpengaruh mobile state) */}
        <div className="hidden md:flex w-full h-full">
          <div className="w-1/4 border-r">
            <LeftPanel
              onSelectFriend={handleSelectFriend}
              onOpenProfile={handleOpenProfile}
            />
          </div>
          <div className="flex-1">
            {activeFriend ? (
              <ChatPanel
                selectedFriend={activeFriend}
                onOpenProfile={handleOpenProfile}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Pilih teman untuk memulai chat
              </div>
            )}
          </div>
          {showProfile && activeProfile && (
            <div className="w-1/4 border-l">
              <ProfilePanel
                selectedUser={activeProfile}
                onClose={() => setShowProfile(false)}
              />
            </div>
          )}
        </div>

        {/* ✅ MOBILE MODE (full responsive) */}
        <div className="md:hidden w-full h-full bg-white relative">
          {mobileView === 'left' && (
            <LeftPanel
              onSelectFriend={handleSelectFriend}
              onOpenProfile={handleOpenProfile}
            />
          )}
          {mobileView === 'chat' && activeFriend && (
            <ChatPanel
              selectedFriend={activeFriend}
              onOpenProfile={handleOpenProfile}
            />
          )}
          {mobileView === 'profile' && activeProfile && (
            <ProfilePanel
              selectedUser={activeProfile}
              onClose={() => window.history.back()}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
