import { RadioGroup, RadioGroupItem, Text, cn } from "@/components/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3">
      <Text
        variant="caption"
        tone="subtle"
        uppercase
        className="tracking-[0.2em]"
      >
        {title}
      </Text>
      <RadioGroup
        value={value}
        onValueChange={handleChange}
        data-testid={dataTestId}
        className="gap-2"
      >
        {items?.map((item) => (
          <RadioGroupItem
            key={item.value}
            value={item.value}
            label={item.label}
            labelClassName={cn(
              "text-sm font-medium transition-colors",
              item.value === value ? "text-foreground-base" : "text-foreground-muted"
            )}
            className={cn(
              "h-4 w-4 border-border-muted",
              item.value === value && "!border-border-interactive"
            )}
            data-testid={item.value === value ? "radio-label" : undefined}
          />
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
