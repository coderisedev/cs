import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { cn } from "@/components/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm text-foreground-muted",
        className
      )}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-foreground-muted transition-colors hover:text-foreground-base"
        onClick={() => handleDelete(id)}
        aria-label={typeof children === "string" ? children : "Remove item"}
      >
        {isDeleting ? <Spinner className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
