// Placeholder: Task list component for tester dashboard
export function TesterTaskList() {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">Test Login Flow</h3>
            <p className="text-sm text-gray-500">Budget: $25 • Due: 24h</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
            Start
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">Test Signup Flow</h3>
            <p className="text-sm text-gray-500">Budget: $20 • Due: 48h</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
            Start
          </button>
        </div>
      </div>
    </div>
  )
}
