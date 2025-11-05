import { Checkbox, Text } from "@/components/ui"
import React, { useId } from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  'data-testid': dataTestId
}) => {
  const generatedId = useId()
  const inputId = name ?? generatedId

  return (
    <label htmlFor={inputId} className="flex items-center gap-3">
      <Checkbox
        id={inputId}
        checked={checked}
        onCheckedChange={() => onChange?.()}
        name={name}
        data-testid={dataTestId}
      />
      <Text variant="body" weight="medium">
        {label}
      </Text>
    </label>
  )
}

export default CheckboxWithLabel
