import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Order History</h1>
          <p className="text-sm text-gray-600 mt-1">
            View all your orders and delivery status
          </p>
        </div>
        <div className="p-6">
          <OrderOverview orders={orders} />
        </div>
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <TransferRequestForm />
        </div>
      </div>
    </div>
  )
}
