"use client"

import { Button, Heading, Text, cn } from "@/components/ui"
import React, { useEffect, useState, useActionState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"

import useToggleState from "@lib/hooks/use-toggle-state"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import AddressFormFields from "./address-form-fields"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={cn(
          "flex h-full min-h-[220px] w-full flex-col justify-between rounded-2xl border border-border-base bg-surface-primary p-5 transition-colors",
          {
            "border-foreground-interactive shadow-sm": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <Heading as="p" size="sm" className="text-left" data-testid="address-name">
            {address.first_name} {address.last_name}
          </Heading>
          {address.company && (
            <Text variant="body-sm" tone="subtle" data-testid="address-company">
              {address.company}
            </Text>
          )}
          <Text as="div" className="mt-3 flex flex-col text-left" variant="body">
            <span className="text-sm" data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span className="text-sm" data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span className="text-sm" data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-medium"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-medium text-foreground-danger"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner className="h-4 w-4" /> : <Trash className="h-4 w-4" />}
            Remove
          </Button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading as="h3" size="sm" className="mb-2">
            Edit address
          </Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <AddressFormFields
              formId={`address-${address.id}`}
              region={region}
              defaults={address}
            />
            {formState.error && (
              <Text tone="danger" className="py-2 text-sm">
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

export default EditAddress
