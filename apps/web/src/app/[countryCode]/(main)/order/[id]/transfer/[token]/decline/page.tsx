import { declineTransferRequest } from "@lib/data/orders"
import { Heading, Text } from "@/components/ui"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  const { success, error } = await declineTransferRequest(id, token)

  return (
    <div className="flex flex-col gap-6 px-6 py-16 mx-auto w-full max-w-2xl">
      <TransferImage />
      <div className="flex flex-col gap-4 rounded-3xl border border-border-base bg-surface-primary p-8 shadow-sm">
        {success ? (
          <>
            <Heading as="h1" size="md">
              Order transfer declined
            </Heading>
            <Text tone="subtle">
              Transfer of order {id} has been successfully declined.
            </Text>
          </>
        ) : (
          <>
            <Text tone="danger">
              There was an error declining the transfer. Please try again.
            </Text>
            {error ? (
              <Text tone="danger">Error message: {error}</Text>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
