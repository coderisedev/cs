import { Container } from "@/components/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <Container className="aspect-[9/16] w-full rounded-3xl bg-surface-secondary" />
      <div className="mt-2 flex justify-between">
        <div className="h-6 w-2/5 rounded-full bg-surface-secondary" />
        <div className="h-6 w-1/5 rounded-full bg-surface-secondary" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
