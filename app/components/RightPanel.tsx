export default function RightPanel({ friend }: { friend: any }) {
  if (!friend)
    return (
      <div className="h-full bg-white flex items-center justify-center text-sm sm:text-base">
        Tidak ada info
      </div>
    )
  return (
    <div className="h-full bg-white p-4">
      <img
        src={friend.avatar_url || '/default.jpg'}
        className="w-20 h-20 rounded-full mb-2"
      />
      <h2 className="font-bold text-lg">{friend.username}</h2>
      <p className="text-gray-600 text-sm sm:text-base">{friend.bio}</p>
      <p className="text-gray-400 text-xs sm:text-sm mt-2">UUID: {friend.id}</p>
    </div>
  )
}
