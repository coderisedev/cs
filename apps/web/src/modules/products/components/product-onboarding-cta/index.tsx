import { Button, Container, Text } from "@/components/ui"
import { cookies as nextCookies } from "next/headers"

async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  return (
    <Container className="max-w-4xl h-full w-full rounded-3xl bg-surface-secondary p-8">
      <div className="flex flex-col gap-y-4 text-center">
        <Text className="text-foreground-base text-xl font-semibold">
          Your demo product was successfully created! 🎉
        </Text>
        <Text tone="subtle" variant="body-sm">
          You can now continue setting up your store in the admin.
        </Text>
        <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
          <Button className="w-full" size="lg">
            Continue setup in admin
          </Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
