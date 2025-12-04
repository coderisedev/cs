// @ts-nocheck - React Email has type compatibility issues with React 19
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Row,
  Column,
  Img,
  Tailwind,
} from "@react-email/components"
import * as React from "react"

interface OrderItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail?: string
  variant?: {
    title?: string
  }
}

interface ShippingAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
}

interface OrderConfirmationEmailProps {
  order?: {
    id: string
    display_id?: number
    email?: string
    created_at?: string
    items?: OrderItem[]
    shipping_address?: ShippingAddress
    subtotal?: number
    shipping_total?: number
    tax_total?: number
    total?: number
    currency_code?: string
  }
}

function formatPrice(amount: number | undefined, currencyCode: string = "USD"): string {
  if (amount === undefined) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100)
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function OrderConfirmationEmailComponent({ order }: OrderConfirmationEmailProps) {
  const orderNumber = order?.display_id || order?.id?.slice(-8) || "N/A"
  const currencyCode = order?.currency_code || "USD"

  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has been confirmed</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-gray-200 rounded-lg my-10 mx-auto p-8 max-w-xl">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-gray-900 text-2xl font-bold m-0">
                Cockpit Simulator
              </Heading>
            </Section>

            {/* Order Confirmation */}
            <Section className="mb-8">
              <Heading className="text-gray-900 text-xl font-semibold mb-4">
                Thank you for your order!
              </Heading>
              <Text className="text-gray-600 text-base leading-6 m-0">
                We've received your order and we're getting it ready. A confirmation
                email has been sent to {order?.email || "your email address"}.
              </Text>
            </Section>

            {/* Order Details */}
            <Section className="bg-gray-50 rounded-lg p-4 mb-8">
              <Row>
                <Column>
                  <Text className="text-gray-500 text-sm m-0">Order Number</Text>
                  <Text className="text-gray-900 text-base font-semibold m-0">
                    #{orderNumber}
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-500 text-sm m-0">Order Date</Text>
                  <Text className="text-gray-900 text-base font-semibold m-0">
                    {formatDate(order?.created_at)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Order Items */}
            <Section className="mb-8">
              <Heading className="text-gray-900 text-lg font-semibold mb-4">
                Order Summary
              </Heading>

              {order?.items?.map((item) => (
                <Row key={item.id} className="mb-4">
                  <Column className="w-16">
                    {item.thumbnail ? (
                      <Img
                        src={item.thumbnail}
                        alt={item.title}
                        width={60}
                        height={60}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                    )}
                  </Column>
                  <Column className="pl-4">
                    <Text className="text-gray-900 text-base font-medium m-0">
                      {item.title}
                    </Text>
                    {item.variant?.title && (
                      <Text className="text-gray-500 text-sm m-0">
                        {item.variant.title}
                      </Text>
                    )}
                    <Text className="text-gray-500 text-sm m-0">
                      Qty: {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text className="text-gray-900 text-base font-medium m-0">
                      {formatPrice(item.unit_price * item.quantity, currencyCode)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr className="border-gray-200 my-4" />

              {/* Totals */}
              <Row className="mb-2">
                <Column>
                  <Text className="text-gray-600 text-sm m-0">Subtotal</Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-900 text-sm m-0">
                    {formatPrice(order?.subtotal, currencyCode)}
                  </Text>
                </Column>
              </Row>
              <Row className="mb-2">
                <Column>
                  <Text className="text-gray-600 text-sm m-0">Shipping</Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-900 text-sm m-0">
                    {formatPrice(order?.shipping_total, currencyCode)}
                  </Text>
                </Column>
              </Row>
              <Row className="mb-2">
                <Column>
                  <Text className="text-gray-600 text-sm m-0">Tax</Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-900 text-sm m-0">
                    {formatPrice(order?.tax_total, currencyCode)}
                  </Text>
                </Column>
              </Row>
              <Hr className="border-gray-200 my-4" />
              <Row>
                <Column>
                  <Text className="text-gray-900 text-base font-semibold m-0">
                    Total
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-900 text-base font-semibold m-0">
                    {formatPrice(order?.total, currencyCode)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Address */}
            {order?.shipping_address && (
              <Section className="mb-8">
                <Heading className="text-gray-900 text-lg font-semibold mb-4">
                  Shipping Address
                </Heading>
                <Text className="text-gray-600 text-base leading-6 m-0">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                  <br />
                  {order.shipping_address.address_1}
                  {order.shipping_address.address_2 && (
                    <>
                      <br />
                      {order.shipping_address.address_2}
                    </>
                  )}
                  <br />
                  {order.shipping_address.city}, {order.shipping_address.province}{" "}
                  {order.shipping_address.postal_code}
                  <br />
                  {order.shipping_address.country_code?.toUpperCase()}
                </Text>
              </Section>
            )}

            {/* Footer */}
            <Hr className="border-gray-200 my-8" />
            <Section className="text-center">
              <Text className="text-gray-500 text-sm m-0">
                If you have any questions, please contact us at{" "}
                <Link
                  href="mailto:support@cockpitsimulator.com"
                  className="text-blue-600"
                >
                  support@cockpitsimulator.com
                </Link>
              </Text>
              <Text className="text-gray-400 text-xs mt-4">
                &copy; {new Date().getFullYear()} Cockpit Simulator. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const orderConfirmationEmail = (props: OrderConfirmationEmailProps) => (
  <OrderConfirmationEmailComponent {...props} />
)

// Mock data for preview/development
const mockOrder: OrderConfirmationEmailProps = {
  order: {
    id: "order_123456789",
    display_id: 1001,
    email: "customer@example.com",
    created_at: new Date().toISOString(),
    currency_code: "usd",
    items: [
      {
        id: "item_1",
        title: "CS737-Pro Flight Simulator",
        quantity: 1,
        unit_price: 299900,
        thumbnail: "https://img.aidenlux.com/products/cs737-pro.jpg",
        variant: {
          title: "Standard Edition",
        },
      },
    ],
    shipping_address: {
      first_name: "John",
      last_name: "Doe",
      address_1: "123 Aviation Way",
      city: "Seattle",
      province: "WA",
      postal_code: "98101",
      country_code: "us",
    },
    subtotal: 299900,
    shipping_total: 0,
    tax_total: 27000,
    total: 326900,
  },
}

export default () => <OrderConfirmationEmailComponent {...mockOrder} />
