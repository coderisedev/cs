import { mockMedusaClient } from "@cs/medusa-client"

export const getOrders = () => mockMedusaClient.listOrders()
export const getAddresses = () => mockMedusaClient.listCustomerAddresses()
