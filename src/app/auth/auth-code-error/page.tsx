import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-bold mb-2">Authentication failed</h1>
        <p className="text-gray-400 mb-6">
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  )
}
