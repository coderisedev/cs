import { Input, Text } from "@/components/ui"
import CountrySelect from "@modules/checkout/components/country-select"
import { HttpTypes } from "@medusajs/types"
import React from "react"

type AddressFormFieldsProps = {
  formId: string
  region: HttpTypes.StoreRegion
  defaults?: Partial<HttpTypes.StoreCustomerAddress>
}

const AddressFormFields = ({
  formId,
  region,
  defaults,
}: AddressFormFieldsProps) => {
  const fieldId = (name: string) => `${formId}-${name}`

  return (
    <div className="grid gap-y-3">
      <div className="grid gap-3 small:grid-cols-2">
        <FormField label="First name" htmlFor={fieldId("first_name")} required>
          <Input
            id={fieldId("first_name")}
            name="first_name"
            autoComplete="given-name"
            defaultValue={defaults?.first_name ?? ""}
            data-testid="first-name-input"
            required
          />
        </FormField>
        <FormField label="Last name" htmlFor={fieldId("last_name")} required>
          <Input
            id={fieldId("last_name")}
            name="last_name"
            autoComplete="family-name"
            defaultValue={defaults?.last_name ?? ""}
            data-testid="last-name-input"
            required
          />
        </FormField>
      </div>

      <FormField label="Company" htmlFor={fieldId("company")}>
        <Input
          id={fieldId("company")}
          name="company"
          autoComplete="organization"
          defaultValue={defaults?.company ?? ""}
          data-testid="company-input"
        />
      </FormField>

      <FormField label="Address" htmlFor={fieldId("address_1")} required>
        <Input
          id={fieldId("address_1")}
          name="address_1"
          autoComplete="address-line1"
          defaultValue={defaults?.address_1 ?? ""}
          data-testid="address-1-input"
          required
        />
      </FormField>

      <FormField
        label="Apartment, suite, etc."
        htmlFor={fieldId("address_2")}
      >
        <Input
          id={fieldId("address_2")}
          name="address_2"
          autoComplete="address-line2"
          defaultValue={defaults?.address_2 ?? ""}
          data-testid="address-2-input"
        />
      </FormField>

      <div className="grid gap-3 small:grid-cols-[150px_1fr]">
        <FormField
          label="Postal code"
          htmlFor={fieldId("postal_code")}
          required
        >
          <Input
            id={fieldId("postal_code")}
            name="postal_code"
            autoComplete="postal-code"
            defaultValue={defaults?.postal_code ?? ""}
            data-testid="postal-code-input"
            required
          />
        </FormField>
        <FormField label="City" htmlFor={fieldId("city")} required>
          <Input
            id={fieldId("city")}
            name="city"
            autoComplete="locality"
            defaultValue={defaults?.city ?? ""}
            data-testid="city-input"
            required
          />
        </FormField>
      </div>

      <FormField label="Province / State" htmlFor={fieldId("province")}>
        <Input
          id={fieldId("province")}
          name="province"
          autoComplete="address-level1"
          defaultValue={defaults?.province ?? ""}
          data-testid="state-input"
        />
      </FormField>

      <FormField label="Country / Region" htmlFor={fieldId("country_code")} required>
        <CountrySelect
          id={fieldId("country_code")}
          name="country_code"
          region={region}
          required
          autoComplete="country"
          defaultValue={defaults?.country_code || undefined}
          data-testid="country-select"
        />
      </FormField>

      <FormField label="Phone" htmlFor={fieldId("phone")}>
        <Input
          id={fieldId("phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={defaults?.phone ?? ""}
          data-testid="phone-input"
        />
      </FormField>
    </div>
  )
}

type FormFieldProps = {
  label: string
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}

const FormField = ({ label, htmlFor, required, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <Text
      as="label"
      htmlFor={htmlFor}
      variant="caption"
      weight="medium"
      tone="subtle"
      className="uppercase tracking-[0.2em]"
    >
      {label}
      {required && (
        <span className="ml-1 text-[hsl(var(--dji-color-status-error))]">*</span>
      )}
    </Text>
    {children}
  </div>
)

export default AddressFormFields
