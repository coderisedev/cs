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
  Hr,
  Tailwind,
} from "@react-email/components"
import * as React from "react"

interface OTPVerificationEmailProps {
  email?: string
  first_name?: string
  otp_code?: string
}

function OTPVerificationEmailComponent({
  email = "user@example.com",
  first_name,
  otp_code = "000000",
}: OTPVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code is {otp_code}</Preview>
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
                Verify Your Email
              </Heading>
              <Text className="text-gray-600 text-base leading-6 m-0">
                Hello{first_name ? ` ${first_name}` : ""},
              </Text>
              <Text className="text-gray-600 text-base leading-6 mt-4">
                Please use the following verification code to complete your registration:
              </Text>
            </Section>

            {/* OTP Code Display */}
            <Section className="text-center my-8">
              <div className="bg-gray-50 rounded-lg py-6 px-4">
                <Text className="text-gray-900 text-4xl font-mono font-bold tracking-widest m-0">
                  {otp_code}
                </Text>
              </div>
            </Section>

            {/* Warning */}
            <Section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <Text className="text-yellow-800 text-sm m-0">
                <strong>Note:</strong> This code will expire in 10 minutes.
                If you didn't request this code, please ignore this email.
              </Text>
            </Section>

            {/* Additional Info */}
            <Section className="mb-8">
              <Text className="text-gray-500 text-sm leading-6 m-0">
                This verification code was requested for the email address:{" "}
                <span className="font-medium text-gray-700">{email}</span>
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border-gray-200 my-8" />
            <Section className="text-center">
              <Text className="text-gray-500 text-sm m-0">
                If you have any questions, please contact us at{" "}
                <a
                  href="mailto:support@cockpitsimulator.com"
                  className="text-blue-600 no-underline"
                >
                  support@cockpitsimulator.com
                </a>
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

export const otpVerificationEmail = (props: OTPVerificationEmailProps) => (
  <OTPVerificationEmailComponent {...props} />
)

// Preview for development
export default () => (
  <OTPVerificationEmailComponent
    otp_code="123456"
    email="test@example.com"
    first_name="John"
  />
)
