import { Text } from "@/components/ui"

import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text variant="body-sm" className="flex gap-2 items-center text-foreground-muted">
      Powered by
      <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
        <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
      &
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs fill="#9ca3af" />
      </a>
    </Text>
  )
}

export default MedusaCTA
