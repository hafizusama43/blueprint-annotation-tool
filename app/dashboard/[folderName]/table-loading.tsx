import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export function TableLoading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-[180px]" />
                    <Skeleton className="h-4 w-[120px]" />
                </div>

                <Skeleton className="h-4 w-[100px]" />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created at</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-6 w-[200px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-[100px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-[80px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-[140px]" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
