import { Heading, Text } from "@/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start gap-4" data-testid="empty-cart-message">
      <Heading as="h1" size="lg" className="flex flex-row gap-x-2 items-baseline">
        Cart
      </Heading>
      <Text className="max-w-[32rem]" tone="subtle">
        You don&apos;t have anything in your cart. Let&apos;s change that, use
        the link below to start browsing our products.
      </Text>
      <div>
        <InteractiveLink href="/store">Explore products</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
