import { Heading, Text } from "@/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  return (
    <div className="flex flex-col gap-6 px-6 py-16 mx-auto w-full max-w-2xl">
      <TransferImage />
      <div className="flex flex-col gap-6 rounded-3xl border border-border-base bg-surface-primary p-8 shadow-sm">
        <Heading as="h1" size="md">
          Transfer request for order {id}
        </Heading>
        <Text tone="subtle">
          You&apos;ve received a request to transfer ownership of order {id}. If you agree, approve the
          transfer below to hand ownership to the requester.
        </Text>
        <div className="h-px w-full bg-border-base" />
        <Text tone="subtle">
          Accepting passes every permission to the new owner. Declining leaves the order in your
          account with no changes.
        </Text>
        <Text tone="subtle">
          If you don&apos;t recognize this request, simply ignore it—no further action is required.
        </Text>
        <div className="h-px w-full bg-border-base" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
