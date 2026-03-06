import { Skeleton } from '@/components/ui/skeleton'

export function FilesSkeleton() {
    return (
        <div className="grid grid-cols-10 grid-rows-5 gap-4">
            {Array.from({ length: 20 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-md" />
            ))}
        </div>
    )
}
