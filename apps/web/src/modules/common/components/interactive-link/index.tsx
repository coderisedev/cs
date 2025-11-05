import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@/components/ui"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex items-center gap-2 text-sm font-semibold text-foreground-interactive transition-colors hover:text-foreground-interactive/80 group"
      href={href}
      onClick={onClick}
      {...props}
    >
      <Text tone="interactive">{children}</Text>
      <ArrowUpRightMini
        className="h-4 w-4 transition-transform duration-150 group-hover:rotate-45"
        color="currentColor"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
