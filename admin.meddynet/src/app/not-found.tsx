import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-8xl font-black text-zinc-800">404</div>
        <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
        <p className="text-zinc-400">
          The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/admin/overview"
          className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
