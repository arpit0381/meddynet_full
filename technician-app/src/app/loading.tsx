export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
