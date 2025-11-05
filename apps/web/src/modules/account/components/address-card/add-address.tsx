"use client"

import { Button, Heading, Text } from "@/components/ui"
import { Plus } from "@medusajs/icons"
import { useEffect, useState, useActionState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"
import AddressFormFields from "./address-form-fields"

const AddAddress = ({
  region,
  addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    isDefaultShipping: addresses.length === 0,
    success: false,
    error: null,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        className="flex h-full min-h-[220px] w-full flex-col justify-between rounded-2xl border border-dashed border-border-base bg-surface-primary p-5 text-left transition-colors hover:border-foreground-interactive"
        onClick={open}
        data-testid="add-address-button"
        type="button"
      >
        <Heading as="p" size="sm">
          New address
        </Heading>
        <Plus className="h-6 w-6 text-foreground-muted" />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading as="h3" size="sm" className="mb-2">
            Add address
          </Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <AddressFormFields formId="new-address" region={region} />
            {formState.error && (
              <Text
                tone="danger"
                className="py-2 text-sm"
                data-testid="address-error"
              >
                {formState.error}
              </Text>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
