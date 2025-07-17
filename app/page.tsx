'use client'
import { useState, useEffect } from 'react'
import LeftPanel from './components/LeftPanel'
import ChatPanel from './components/ChatPanel'
import ProfilePanel from './components/ProfilePanel'
import AuthGuard from './components/AuthGuard'

export default function HomePage() {
  const [activeFriend, setActiveFriend] = useState<any>(null)
  const [activeProfile, setActiveProfile] = useState<any>(null)
  const [view, setView] = useState<'friends' | 'chat' | 'profile'>('friends')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024) // < 1024px dianggap mobile/tablet
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleSelectFriend(friend: any) {
    setActiveFriend(friend)
    setActiveProfile(null)
    if (isMobile) setView('chat')
  }

  function handleOpenProfile(friend: any) {
    setActiveProfile(friend)
    if (isMobile) setView('profile')
  }

  return (
    <AuthGuard>
      <div className="h-screen flex bg-gray-100">
        {/* ✅ DESKTOP MODE (3 panel) */}
        {!isMobile && (
          <>
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
              {activeProfile ? (
                <ProfilePanel
                  selectedUser={activeProfile}
                  onClose={() => setActiveProfile(null)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Pilih teman lalu klik "Profil"
                </div>
              )}
            </div>
          </>
        )}

        {/* ✅ MOBILE MODE (Full screen bergantian) */}
        {isMobile && (
          <>
            {view === 'friends' && (
              <div className="flex-1 bg-white">
                <LeftPanel
                  onSelectFriend={handleSelectFriend}
                  onOpenProfile={handleOpenProfile}
                />
              </div>
            )}

            {view === 'chat' && activeFriend && (
              <div className="flex-1 bg-white relative">
                <ChatPanel
                  selectedFriend={activeFriend}
                  onOpenProfile={handleOpenProfile}
                />
                <button
                  className="absolute top-3 left-3 bg-gray-200 text-sm px-3 py-1 rounded-md"
                  onClick={() => setView('friends')}
                >
                  ← Kembali
                </button>
              </div>
            )}

            {view === 'profile' && activeProfile && (
              <div className="flex-1 bg-white relative">
                <ProfilePanel
                  selectedUser={activeProfile}
                  onClose={() => setView('chat')}
                />
                <button
                  className="absolute top-3 left-3 bg-gray-200 text-sm px-3 py-1 rounded-md"
                  onClick={() => setView('chat')}
                >
                  ← Kembali
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  )
}
