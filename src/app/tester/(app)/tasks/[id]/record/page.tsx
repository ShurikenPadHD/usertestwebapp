import { redirect } from 'next/navigation'

export default function RecordPage({ params }: { params: { id: string } }) {
  redirect(`/tester/tasks/${params.id}/submit`)
}
