// Placeholder: Submission review component for developers
export function SubmissionReview() {
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Video Player</span>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Approve
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Reject
        </button>
      </div>
    </div>
  )
}
