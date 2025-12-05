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
  Button,
  Hr,
  Row,
  Column,
  Tailwind,
} from "@react-email/components"
import * as React from "react"

interface WelcomeEmailProps {
  email?: string
  first_name?: string
  store_url?: string
}

function WelcomeEmailComponent({
  email,
  first_name,
  store_url = "https://cockpitsimulator.com",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Cockpit Simulator - Your journey begins here</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-gray-200 rounded-lg my-10 mx-auto p-8 max-w-xl">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-gray-900 text-2xl font-bold m-0">
                Cockpit Simulator
              </Heading>
            </Section>

            {/* Welcome Message */}
            <Section className="mb-8">
              <Heading className="text-gray-900 text-xl font-semibold mb-4">
                Welcome Aboard!
              </Heading>
              <Text className="text-gray-600 text-base leading-6 m-0">
                Hello{first_name ? ` ${first_name}` : ""},
              </Text>
              <Text className="text-gray-600 text-base leading-6 mt-4">
                Thank you for creating an account with Cockpit Simulator. We're
                excited to have you join our community of aviation enthusiasts and
                professional pilots.
              </Text>
            </Section>

            {/* Account Details */}
            <Section className="bg-gray-50 rounded-lg p-4 mb-8">
              <Text className="text-gray-500 text-sm m-0">Your Account Email</Text>
              <Text className="text-gray-900 text-base font-semibold m-0">
                {email || "your email address"}
              </Text>
            </Section>

            {/* Features */}
            <Section className="mb-8">
              <Heading className="text-gray-900 text-lg font-semibold mb-4">
                What You Can Do
              </Heading>

              <Row className="mb-4">
                <Column className="w-8">
                  <Text className="text-xl m-0">✈️</Text>
                </Column>
                <Column>
                  <Text className="text-gray-900 text-base font-medium m-0">
                    Browse Our Products
                  </Text>
                  <Text className="text-gray-500 text-sm m-0">
                    Explore our premium flight simulators and accessories
                  </Text>
                </Column>
              </Row>

              <Row className="mb-4">
                <Column className="w-8">
                  <Text className="text-xl m-0">📦</Text>
                </Column>
                <Column>
                  <Text className="text-gray-900 text-base font-medium m-0">
                    Track Your Orders
                  </Text>
                  <Text className="text-gray-500 text-sm m-0">
                    View order history and track shipments in real-time
                  </Text>
                </Column>
              </Row>

              <Row className="mb-4">
                <Column className="w-8">
                  <Text className="text-xl m-0">❤️</Text>
                </Column>
                <Column>
                  <Text className="text-gray-900 text-base font-medium m-0">
                    Save Your Favorites
                  </Text>
                  <Text className="text-gray-500 text-sm m-0">
                    Create wishlists and save products for later
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column className="w-8">
                  <Text className="text-xl m-0">🎁</Text>
                </Column>
                <Column>
                  <Text className="text-gray-900 text-base font-medium m-0">
                    Exclusive Offers
                  </Text>
                  <Text className="text-gray-500 text-sm m-0">
                    Get access to member-only deals and early access to new products
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section className="text-center my-8">
              <Button
                href={store_url}
                className="bg-gray-900 rounded-lg text-white text-base font-semibold no-underline text-center px-6 py-3"
              >
                Start Shopping
              </Button>
            </Section>

            {/* Support */}
            <Section className="mb-8">
              <Text className="text-gray-600 text-base leading-6 m-0">
                Need help getting started? Our support team is here to assist you
                every step of the way. Feel free to reach out with any questions.
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border-gray-200 my-8" />
            <Section className="text-center">
              <Text className="text-gray-500 text-sm m-0">
                Questions? Contact us at{" "}
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
              <Text className="text-gray-400 text-xs mt-2">
                You're receiving this email because you created an account at Cockpit
                Simulator.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const welcomeEmail = (props: WelcomeEmailProps) => (
  <WelcomeEmailComponent {...props} />
)

// Mock data for preview/development
const mockData: WelcomeEmailProps = {
  email: "newcustomer@example.com",
  first_name: "John",
  store_url: "https://cockpitsimulator.com",
}

export default () => <WelcomeEmailComponent {...mockData} />
