import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function DevSettingsPage() {
  return (
    <div className="flex-1 p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        <Card variant="glass">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/5 pb-2">Profile</h2>
          <div className="space-y-4">
            <Input label="Display Name" placeholder="Devin" defaultValue="Devin" />
            <Input label="Email" type="email" placeholder="devin@company.com" defaultValue="devin@company.com" />
            <Input label="Company (optional)" placeholder="Acme Inc." />
            <Button variant="secondary">Save Changes</Button>
          </div>
        </Card>

        <Card variant="glass">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/5 pb-2">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-gray-300">New submission to review</span>
              <input type="checkbox" defaultChecked className="rounded border-white/20 bg-[#0a0a0a] accent-blue-500" />
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-gray-300">Task approved by tester</span>
              <input type="checkbox" defaultChecked className="rounded border-white/20 bg-[#0a0a0a] accent-blue-500" />
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-gray-300">Payment reminders</span>
              <input type="checkbox" defaultChecked className="rounded border-white/20 bg-[#0a0a0a] accent-blue-500" />
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-gray-300">Product updates & tips</span>
              <input type="checkbox" className="rounded border-white/20 bg-[#0a0a0a] accent-blue-500" />
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}
