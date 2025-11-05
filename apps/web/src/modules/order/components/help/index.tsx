import { Heading, Text } from "@/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading as="h3" size="sm" className="text-foreground-base">
        Need help?
      </Heading>
      <div className="my-2 text-sm text-foreground-muted">
        <ul className="flex flex-col gap-y-2">
          <li>
            <LocalizedClientLink href="/contact" className="text-foreground-interactive">
              Contact
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact" className="text-foreground-interactive">
              Returns & Exchanges
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
