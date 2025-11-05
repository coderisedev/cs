import { ArrowUpRightMini } from "@medusajs/icons"
import { Metadata } from "next"
import Link from "next/link"
import { Heading, Text } from "@/components/ui"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 text-center min-h-[calc(100vh-64px)]">
      <Heading as="h1" size="lg">
        Page not found
      </Heading>
      <Text tone="subtle" className="max-w-md">
        The page you tried to access does not exist. Double-check the address or return to the
        homepage.
      </Text>
      <Link className="inline-flex items-center gap-2 text-sm font-medium group" href="/">
        <Text tone="interactive" weight="semibold">
          Go to frontpage
        </Text>
        <ArrowUpRightMini
          className="h-4 w-4 text-foreground-interactive transition-transform group-hover:rotate-45"
          aria-hidden
        />
      </Link>
    </div>
  )
}
