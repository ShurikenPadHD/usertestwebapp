import { StripeReturnClient } from './StripeReturnClient'

export default function StripeReturnPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const next = (searchParams?.next && searchParams.next.startsWith('/'))
    ? searchParams.next
    : '/dev/payments'
  return <StripeReturnClient next={next} />
}
