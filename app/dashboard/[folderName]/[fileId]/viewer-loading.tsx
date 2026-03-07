import { Skeleton } from '@/components/ui/skeleton'

export default function ViewerLoading() {
    return (
        <div className="flex w-full h-full">
            {/* LEFT IMAGE SLIDER */}
            <div className="w-64 border-r p-3 space-y-3 overflow-y-auto">
                <Skeleton className="h-6 w-32 mb-4" />

                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-28 rounded-md" />
                ))}
            </div>

            {/* RIGHT CANVAS AREA */}
            <div className="flex-1 flex flex-col p-4 gap-4">
                {/* Top toolbar placeholder */}
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>

                {/* Canvas */}
                <div className="flex-1 border rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>

                {/* Bottom status bar */}
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                </div>
            </div>
        </div>
    )
}
