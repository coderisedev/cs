import { Heading, Text } from "@/components/ui"

import { isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  return (
    <div>
      <Heading as="h2" size="md" className="my-6">
        Payment
      </Heading>
      <div>
        {payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text weight="semibold" className="mb-1">
                Payment method
              </Text>
              <Text tone="subtle" data-testid="payment-method">
                {paymentInfoMap[payment.provider_id].title}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text weight="semibold" className="mb-1">
                Payment details
              </Text>
              <div className="flex gap-2 text-sm text-foreground-muted items-center">
                <div className="flex items-center rounded-full bg-surface-secondary px-2 py-1">
                  {paymentInfoMap[payment.provider_id].icon}
                </div>
                <Text data-testid="payment-amount">
                  {isStripeLike(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} paid at ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString()}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
