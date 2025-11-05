"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button, Container, Text } from "@/components/ui"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <Container className="max-w-4xl h-full w-full rounded-3xl border border-border-base bg-surface-secondary">
      <div className="flex flex-col gap-y-4 p-6 text-center md:items-center">
        <Text className="text-xl font-semibold text-foreground-base">
          Your test order was successfully created! 🎉
        </Text>
        <Text tone="subtle" variant="body-sm">
          You can now complete setting up your store in the admin.
        </Text>
        <Button
          className="w-fit"
          size="lg"
          onClick={() => resetOnboardingState(orderId)}
        >
          Complete setup in admin
        </Button>
      </div>
    </Container>
  )
}

export default OnboardingCta
