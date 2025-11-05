"use client"

import { Button, Heading, Text } from "@/components/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b border-border-base pb-6 last:border-none last:pb-0"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col items-center gap-y-4 rounded-3xl border border-border-base bg-surface-primary p-6 text-center"
      data-testid="no-orders-container"
    >
      <Heading as="h2" size="sm">
        Nothing to see here
      </Heading>
      <Text tone="subtle">
        You don&apos;t have any orders yet, let us change that {":)"}
      </Text>
      <div className="mt-4">
        <LocalizedClientLink href="/" passHref>
          <Button size="lg" data-testid="continue-shopping-button">
            Continue shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
