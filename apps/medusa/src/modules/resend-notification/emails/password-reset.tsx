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
  Tailwind,
} from "@react-email/components"
import * as React from "react"

interface PasswordResetEmailProps {
  url?: string
  email?: string
  first_name?: string
}

function PasswordResetEmailComponent({
  url,
  email,
  first_name,
}: PasswordResetEmailProps) {
  const resetUrl = url || "#"

  return (
    <Html>
      <Head />
      <Preview>Reset your password for Cockpit Simulator</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="bg-white border border-solid border-gray-200 rounded-lg my-10 mx-auto p-8 max-w-xl">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-gray-900 text-2xl font-bold m-0">
                Cockpit Simulator
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-8">
              <Heading className="text-gray-900 text-xl font-semibold mb-4">
                Reset Your Password
              </Heading>
              <Text className="text-gray-600 text-base leading-6 m-0">
                Hello{first_name ? ` ${first_name}` : ""},
              </Text>
              <Text className="text-gray-600 text-base leading-6 mt-4">
                We received a request to reset the password for your account
                {email ? ` (${email})` : ""}. Click the button below to create a new
                password.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center my-8">
              <Button
                href={resetUrl}
                className="bg-gray-900 rounded-lg text-white text-base font-semibold no-underline text-center px-6 py-3"
              >
                Reset Password
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-8">
              <Text className="text-gray-600 text-sm leading-6">
                Or copy and paste this URL into your browser:
              </Text>
              <Link
                href={resetUrl}
                className="text-blue-600 text-sm break-all"
              >
                {resetUrl}
              </Link>
            </Section>

            {/* Expiration Notice */}
            <Section className="bg-yellow-50 rounded-lg p-4 mb-8">
              <Text className="text-yellow-800 text-sm m-0">
                <strong>Note:</strong> This password reset link will expire in 1 hour
                for security reasons. If you didn't request a password reset, you can
                safely ignore this email.
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="mb-8">
              <Text className="text-gray-500 text-sm leading-6 m-0">
                For your security, we'll never ask you for your password via email.
                If you're concerned about the security of your account, please contact
                our support team.
              </Text>
            </Section>

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

export const passwordResetEmail = (props: PasswordResetEmailProps) => (
  <PasswordResetEmailComponent {...props} />
)

// Mock data for preview/development
const mockData: PasswordResetEmailProps = {
  url: "https://cockpitsimulator.com/reset-password?token=sample-token-123",
  email: "customer@example.com",
  first_name: "John",
}

export default () => <PasswordResetEmailComponent {...mockData} />
