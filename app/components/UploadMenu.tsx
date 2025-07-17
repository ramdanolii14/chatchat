'use client'
import { supabase } from '@/lib/supabaseClient'

export default function UploadMenu({ friendId }: { friendId: string }) {
  async function handleUpload(e: any, type: string) {
    const file = e.target.files[0]
    if (!file) return

    const { data } = await supabase.storage
      .from('chat-media')
      .upload(`${type}/${Date.now()}-${file.name}`, file)

    if (data) {
      const { data: publicData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(data.path)

      await supabase.from('messages').insert({
        receiver_id: friendId,
        media_url: publicData.publicUrl,
        media_type: type
      })
    }
  }

  return (
    <div className="absolute bottom-16 left-4 bg-white p-2 border rounded-md shadow-md space-y-1">
      {['photo', 'video', 'music', 'document'].map(type => (
        <label
          key={type}
          className="block cursor-pointer hover:text-red-500 text-sm sm:text-base"
        >
          {type}
          <input
            type="file"
            className="hidden"
            onChange={(e)=>handleUpload(e,type)}
          />
        </label>
      ))}
    </div>
  )
}
