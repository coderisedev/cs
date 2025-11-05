import { Input as BaseInput, Text, cn } from "@/components/ui"
import React, {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      name,
      label,
      touched,
      errors,
      required,
      topLabel,
      className,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const generatedId = useId()
    const inputId = name || generatedId

    useImperativeHandle(ref, () => inputRef.current!)

    useEffect(() => {
      if (type !== "password") {
        setShowPassword(false)
      }
    }, [type])

    const hasError =
      !!errors &&
      !!touched &&
      !!name &&
      touched[name] &&
      typeof errors[name] !== "undefined"

    return (
      <div className="flex w-full flex-col gap-1">
        {topLabel && (
          <Text
            variant="caption"
            tone="subtle"
            className="uppercase tracking-[0.2em]"
          >
            {topLabel}
          </Text>
        )}
        <label htmlFor={inputId} className="flex flex-col gap-1">
          <Text
            as="span"
            variant="body-sm"
            tone="subtle"
            weight="medium"
            className="uppercase tracking-[0.2em]"
          >
            {label}
            {required && (
              <span className="ml-1 text-[hsl(var(--dji-color-status-error))]">
                *
              </span>
            )}
          </Text>
          <div className="relative">
            <BaseInput
              type={type === "password" && showPassword ? "text" : type}
              name={name}
              id={inputId}
              ref={inputRef}
              required={required}
              className={cn(type === "password" && "pr-10", className)}
              {...props}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted transition hover:text-foreground-base"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            )}
          </div>
        </label>
        {hasError && name && (
          <Text tone="danger" variant="caption">
            {String(errors?.[name] ?? "")}
          </Text>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
