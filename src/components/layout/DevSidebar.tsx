import Link from 'next/link'

export function DevSidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold">UserTest</h2>
        <p className="text-sm text-gray-500">Developer</p>
      </div>
      <nav className="space-y-2">
        <Link href="/dev" className="block p-2 rounded hover:bg-gray-200">
          Dashboard
        </Link>
        <Link href="/dev/submissions" className="block p-2 rounded hover:bg-gray-200">
          Submissions
        </Link>
        <Link href="/dev/payments" className="block p-2 rounded hover:bg-gray-200">
          Payments
        </Link>
        <Link href="/dev/settings" className="block p-2 rounded hover:bg-gray-200">
          Settings
        </Link>
      </nav>
    </aside>
  )
}
