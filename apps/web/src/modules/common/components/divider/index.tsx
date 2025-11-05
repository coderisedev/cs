import { cn } from "@/components/ui"

const Divider = ({ className }: { className?: string }) => (
  <div
    className={cn("mt-1 h-px w-full border-b border-border-base", className)}
  />
)

export default Divider
