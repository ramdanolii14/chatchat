'use client'
import { useState, useEffect } from 'react'
import LeftPanel from './components/LeftPanel'
import ChatPanel from './components/ChatPanel'
import ProfilePanel from './components/ProfilePanel'
import AuthGuard from './components/AuthGuard'

export default function HomePage() {
  const [activeFriend, setActiveFriend] = useState<any>(null)
  const [activeProfile, setActiveProfile] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [mobileView, setMobileView] = useState<'left' | 'chat' | 'profile'>('left')

  useEffect(() => {
    function handlePopState() {
      if (window.innerWidth < 768) {
        setMobileView('left')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
        {/* ✅ DESKTOP TIDAK BERUBAH */}

        {/* ✅ MOBILE MODE */}
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
              onClose={() => window.history.back()} // kembali pakai tombol back HP
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
