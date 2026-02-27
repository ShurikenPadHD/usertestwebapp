// Placeholder: Task list component for developer dashboard
export function TaskList() {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">Test Login Flow</h3>
            <p className="text-sm text-gray-500">myapp.com • Budget: $25</p>
          </div>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
            In Review
          </span>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">Test Checkout Flow</h3>
            <p className="text-sm text-gray-500">myapp.com • Budget: $30</p>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
            Posted
          </span>
        </div>
      </div>
    </div>
  )
}
