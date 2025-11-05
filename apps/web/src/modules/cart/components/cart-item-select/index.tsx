"use client"

import { cn } from "@/components/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import ChevronDown from "@modules/common/icons/chevron-down"

type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Select...", className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    return (
      <div
        className={cn(
          "relative inline-flex items-center rounded-pill border border-border-base bg-surface-primary text-sm font-medium text-foreground-base",
          isPlaceholder && "text-foreground-muted",
          className
        )}
      >
        <select
          ref={innerRef}
          {...props}
          className="h-10 w-full appearance-none bg-transparent px-4 pr-8 outline-none"
        >
          <option disabled value="">
            {placeholder}
          </option>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 text-foreground-muted">
          <ChevronDown />
        </span>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
