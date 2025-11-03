import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      shipped: "bg-purple-500",
      canceled: "bg-red-500",
    }
    return statusMap[status] || "bg-gray-500"
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white" data-testid="order-card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="mb-2 md:mb-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Order #<span data-testid="order-display-id">{order.display_id}</span>
          </h3>
          <p className="text-sm text-gray-600" data-testid="order-created-at">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-semibold text-gray-900" data-testid="order-amount">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {order.items?.slice(0, 4).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2"
              data-testid="order-item"
            >
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              </div>
              <div className="text-sm">
                <p
                  className="font-medium text-gray-900 truncate"
                  data-testid="item-title"
                >
                  {i.title}
                </p>
                <p className="text-gray-600" data-testid="item-quantity">Qty: {i.quantity}</p>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg">
            <span className="text-2xl font-bold text-gray-900">
              +{numberOfProducts - 4}
            </span>
            <span className="text-sm text-gray-600">more items</span>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-testid="order-details-link">
            View Details
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
