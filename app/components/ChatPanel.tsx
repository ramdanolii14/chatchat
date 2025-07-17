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
  const [replyTo, setReplyTo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const channelRef = useRef<any>(null)
  const touchStartX = useRef<number>(0)

  // ✅ Ambil user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  // ✅ Ambil chat saat pilih teman
  useEffect(() => {
    if (!user || !selectedFriend) return

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      setMessages(data || [])
    }

    fetchMessages()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [user, selectedFriend])

  // ✅ Realtime Global (untuk sender & receiver)
  useEffect(() => {
    if (!user) return

    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel('messages-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any

          // Jika chat lagi dibuka
          if (
            selectedFriend &&
            ((newMessage.sender_id === user.id &&
              newMessage.receiver_id === selectedFriend.id) ||
              (newMessage.sender_id === selectedFriend.id &&
                newMessage.receiver_id === user.id))
          ) {
            setMessages((prev) => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [user, selectedFriend])

  // ✅ Auto scroll ke bawah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!message.trim() || !user) return
    const replyPrefix = replyTo ? `[reply:${replyTo.id}] ` : ''

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        receiver_id: selectedFriend.id,
        content: replyPrefix + message,
        created_at: new Date().toISOString()
      }
    ])

    setMessage('')
    setReplyTo(null)

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedFriend.id,
      content: replyPrefix + message
    })
    if (error) console.error(error)
  }

  async function handleFileUpload(event: any) {
    const file = event.target.files[0]
    if (!file || !user) return
    setLoading(true)
    setUploadProgress(0)

    const ext = file.name.split('.').pop()?.toLowerCase()
    const filePath = `${user.id}/${Date.now()}.${ext}`

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => (p < 90 ? p + 10 : p))
    }, 200)

    const { error: uploadError } = await supabase.storage
      .from('chat-uploads')
      .upload(filePath, file)

    clearInterval(progressInterval)

    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from('chat-uploads')
        .getPublicUrl(filePath)

      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          sender_id: user.id,
          receiver_id: selectedFriend.id,
          content: `[file:${ext}] ${publicUrl.publicUrl}`,
          created_at: new Date().toISOString()
        }
      ])

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedFriend.id,
        content: `[file:${ext}] ${publicUrl.publicUrl}`
      })

      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
    } else {
      console.error(uploadError)
    }

    setLoading(false)
  }

  function handleReply(m: any) {
    setReplyTo(m)
  }

  function renderMessageContent(m: any) {
    let content = m.content
    let replyBox = null

    if (content.startsWith('[reply:')) {
      const replyId = content.match(/\[reply:(.*?)\]/)?.[1]
      const realContent = content.replace(/\[reply:.*?\]\s?/, '')
      const repliedMessage = messages.find((msg) => msg.id === replyId)
      replyBox = repliedMessage ? (
        <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded mb-1 border-l-4 border-gray-400">
          Reply to:{' '}
          {repliedMessage.content.startsWith('[file:')
            ? '📎 File'
            : repliedMessage.content}
        </div>
      ) : null
      content = realContent
    }

    if (content.startsWith('[file:')) {
      const url = content.replace(/\[file:.*?\]\s?/, '').trim()
      const type = content.match(/\[file:(.*?)\]/)?.[1]

      if (!url || !type) return <a href={url}>📎 File</a>
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type))
        return (
          <>
            {replyBox}
            <img src={url} className="max-w-[180px] rounded-md border" />
          </>
        )
      if (['mp4', 'webm', 'ogg'].includes(type))
        return (
          <>
            {replyBox}
            <video controls className="max-w-[200px] rounded-md">
              <source src={url} type={`video/${type}`} />
            </video>
          </>
        )
      if (['mp3', 'wav', 'ogg'].includes(type))
        return (
          <>
            {replyBox}
            <audio controls className="w-[250px]">
              <source src={url} type={`audio/${type}`} />
            </audio>
          </>
        )
      return (
        <>
          {replyBox}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-600"
          >
            📎 {url.split('/').pop()}
          </a>
        </>
      )
    }

    return (
      <>
        {replyBox}
        <span>{content}</span>
      </>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center">
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
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`p-2 rounded-md max-w-xs break-words relative ${
                m.sender_id === user?.id
                  ? 'bg-red-500 text-white ml-auto'
                  : 'bg-gray-200 text-black'
              }`}
              onContextMenu={(e) => {
                e.preventDefault()
                handleReply(m)
              }}
              onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                const diff = e.changedTouches[0].clientX - touchStartX.current
                if (diff > 50) handleReply(m)
              }}
            >
              {renderMessageContent(m)}
              {m.sender_id === user?.id && (
                <div className="text-[10px] text-right opacity-70 mt-1">
                  ✅
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef}></div>
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-gray-100 p-2 border-t text-xs flex justify-between items-center">
          <div className="truncate max-w-[80%]">
            Replying to:{' '}
            {replyTo.content.startsWith('[file:')
              ? '📎 File'
              : replyTo.content}
          </div>
          <button
            className="text-red-500 text-xs"
            onClick={() => setReplyTo(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 border-t flex flex-col space-y-2">
        {loading && (
          <div className="h-1 bg-gray-200 rounded">
            <div
              className="h-1 bg-red-500 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        <div className="flex items-center space-x-2">
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
            className="flex-1 p-2 border rounded-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  )
}
