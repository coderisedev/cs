"use client"

import { acceptTransferRequest, declineTransferRequest } from "@lib/data/orders"
import { Button, Text } from "@/components/ui"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-4">
      {status?.accept === "success" && (
        <Text tone="success">
          Order transferred successfully!
        </Text>
      )}
      {status?.decline === "success" && (
        <Text tone="success">
          Order transfer declined successfully!
        </Text>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={acceptTransfer}
            loading={status?.accept === "pending"}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Accept transfer
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={declineTransfer}
            loading={status?.decline === "pending"}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Decline transfer
          </Button>
        </div>
      )}
      {errorMessage && <Text tone="danger">{errorMessage}</Text>}
    </div>
  )
}

export default TransferActions
