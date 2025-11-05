"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Text,
} from "@/components/ui"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple" className="divide-y divide-border-base">
        {tabs.map((tab, i) => (
          <AccordionItem key={i} value={tab.label} className="py-2">
            <AccordionTrigger className="justify-between text-left text-base font-semibold text-foreground-base">
              {tab.label}
            </AccordionTrigger>
            <AccordionContent className="pt-4 text-sm text-foreground-base">
              {tab.component}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <Text weight="semibold">Material</Text>
            <Text tone="subtle">{product.material ? product.material : "-"}</Text>
          </div>
          <div>
            <Text weight="semibold">Country of origin</Text>
            <Text tone="subtle">
              {product.origin_country ? product.origin_country : "-"}
            </Text>
          </div>
          <div>
            <Text weight="semibold">Type</Text>
            <Text tone="subtle">{product.type ? product.type.value : "-"}</Text>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <Text weight="semibold">Weight</Text>
            <Text tone="subtle">{product.weight ? `${product.weight} g` : "-"}</Text>
          </div>
          <div>
            <Text weight="semibold">Dimensions</Text>
            <Text tone="subtle">
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-3">
          <FastDelivery />
          <div>
            <Text weight="semibold">Fast delivery</Text>
            <Text tone="subtle" className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </Text>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Refresh />
          <div>
            <Text weight="semibold">Simple exchanges</Text>
            <Text tone="subtle" className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </Text>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Back />
          <div>
            <Text weight="semibold">Easy returns</Text>
            <Text tone="subtle" className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
