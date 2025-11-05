import { Button, Heading, Text } from "@/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="rounded-3xl border border-border-base bg-surface-primary px-6 py-8 flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
      <div>
        <Heading as="h2" size="md">
          Already have an account?
        </Heading>
        <Text tone="subtle" className="mt-2">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <Button asChild variant="secondary" size="lg" data-testid="sign-in-button">
          <LocalizedClientLink href="/account">
            Sign in
          </LocalizedClientLink>
        </Button>
      </div>
    </div>
  )
}

export default SignInPrompt
