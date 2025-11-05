import { Table } from "@/components/ui"

import repeat from "@lib/util/repeat"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"
import SkeletonCodeForm from "@modules/skeletons/components/skeleton-code-form"
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
          <div className="flex flex-col gap-y-6 rounded-3xl border border-border-base bg-surface-primary p-6">
            <div className="flex items-start justify-between bg-transparent">
              <div className="flex flex-col gap-y-2">
                <div className="h-8 w-60 animate-pulse rounded-full bg-surface-secondary" />
                <div className="h-6 w-48 animate-pulse rounded-full bg-surface-secondary" />
              </div>
              <div>
                <div className="h-8 w-14 animate-pulse rounded-full bg-surface-secondary" />
              </div>
            </div>
            <div>
              <div className="pb-3 flex items-center">
                <div className="h-12 w-20 animate-pulse rounded-full bg-surface-secondary" />
              </div>
              <Table>
                <Table.Header className="border-t-0">
                  <Table.Row>
                    <Table.HeaderCell className="!pl-0">
                      <div className="h-6 w-10 animate-pulse rounded-full bg-surface-secondary" />
                    </Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="h-6 w-16 animate-pulse rounded-full bg-surface-secondary" />
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="h-6 w-12 animate-pulse rounded-full bg-surface-secondary" />
                    </Table.HeaderCell>
                    <Table.HeaderCell className="!pr-0">
                      <div className="flex justify-end">
                        <div className="h-6 w-12 animate-pulse rounded-full bg-surface-secondary" />
                      </div>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {repeat(4).map((index) => (
                    <SkeletonCartItem key={index} />
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
          <div className="flex flex-col gap-y-8">
            <SkeletonOrderSummary />
            <SkeletonCodeForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
