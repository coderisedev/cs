import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@/components/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <Heading as="h2" size="md" className="my-6">
        Delivery
      </Heading>
      <div className="flex items-start gap-x-8">
        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text weight="semibold" className="mb-1">
            Shipping Address
          </Text>
          <Text tone="subtle">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text tone="subtle">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text tone="subtle">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text tone="subtle">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col w-1/3 "
          data-testid="shipping-contact-summary"
        >
          <Text weight="semibold" className="mb-1">Contact</Text>
          <Text tone="subtle">
            {order.shipping_address?.phone}
          </Text>
          <Text tone="subtle">{order.email}</Text>
        </div>

        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text weight="semibold" className="mb-1">Method</Text>
          <Text tone="subtle">
            {(order as any).shipping_methods[0]?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
