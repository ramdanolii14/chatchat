'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ChatPanel({
  selectedFriend,
  onOpenProfile
}: {
  selectedFriend: any
  onOpenProfile?: (f: any) => void
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!selectedFriend) return
    let channel: any

    async function fetchMessages() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      setUser(userData.user)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userData.user.id},receiver_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},receiver_id.eq.${userData.user.id})`
        )
        .order('created_at', { ascending: true })

      setMessages(data || [])

      channel = supabase
        .channel('room-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMessage = payload.new as any
            if (
              (newMessage.sender_id === userData.user.id &&
                newMessage.receiver_id === selectedFriend.id) ||
              (newMessage.sender_id === selectedFriend.id &&
                newMessage.receiver_id === userData.user.id)
            ) {
              setMessages((prev) =>
                prev.find((m) => m.id === newMessage.id)
                  ? prev
                  : [...prev, newMessage]
              )
            }
          }
        )
        .subscribe()
    }

    fetchMessages()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [selectedFriend])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!message.trim() || !user) return
    setLoading(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedFriend.id,
      content: message
    })
    if (!error) setMessage('')
    else console.error(error)
    setLoading(false)
  }

  async function handleFileUpload(event: any) {
    const file = event.target.files[0]
    if (!file || !user) return
    setLoading(true)

    const ext = file.name.split('.').pop()?.toLowerCase()
    const filePath = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('chat-uploads')
      .upload(filePath, file)

    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from('chat-uploads')
        .getPublicUrl(filePath)

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedFriend.id,
        content: `[file:${ext}] ${publicUrl.publicUrl}`
      })
    } else {
      console.error(uploadError)
    }
    setLoading(false)
  }

  function renderMessageContent(content: string) {
    if (!content.startsWith('[file:')) {
      return <span>{content}</span>
    }

    const url = content.split(' ')[1]
    const type = content.match(/\[file:(.*?)\]/)?.[1]

    if (!url || !type) return <a href={url}>📎 File</a>

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
      return (
        <img
          src={url}
          alt="gambar"
          className="max-w-full sm:max-w-[220px] rounded-md border"
        />
      )
    }
    if (['mp4', 'webm', 'ogg'].includes(type)) {
      return (
        <video
          controls
          className="max-w-full sm:max-w-[260px] rounded-md"
        >
          <source src={url} type={`video/${type}`} />
        </video>
      )
    }
    if (['mp3', 'wav', 'ogg'].includes(type)) {
      return (
        <audio controls className="w-full sm:w-[240px]">
          <source src={url} type={`audio/${type}`} />
        </audio>
      )
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline text-blue-600"
      >
        📎 {url.split('/').pop()}
      </a>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* ✅ Header dengan padding di mobile */}
      <div className="relative p-3 border-b flex items-center justify-between">
        <div className="flex items-center pl-10 sm:pl-0">
          <img
            src={selectedFriend.avatar_url || '/default.jpg'}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="font-medium">{selectedFriend.username}</span>
        </div>
        {onOpenProfile && (
          <button
            onClick={() => onOpenProfile(selectedFriend)}
            className="text-xs text-blue-500 underline"
          >
            Profil
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {[...new Map(messages.map((m) => [m.id, m])).values()].map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-md max-w-[80%] sm:max-w-sm break-words ${
              m.sender_id === user?.id
                ? 'bg-red-500 text-white ml-auto'
                : 'bg-gray-200 text-black'
            }`}
          >
            {renderMessageContent(m.content)}
            <div className="text-[10px] text-gray-400 mt-1 text-right">
              {new Date(m.created_at).toLocaleTimeString()}
              {m.sender_id === user?.id && ' • ✔'}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t flex items-center space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-200 px-3 py-1 rounded-md"
        >
          ➕
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          type="text"
          placeholder="Ketik pesan..."
          className="flex-1 p-2 border rounded-md text-sm sm:text-base"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          {loading ? '⏳' : 'Kirim'}
        </button>
      </div>
    </div>
  )
}
