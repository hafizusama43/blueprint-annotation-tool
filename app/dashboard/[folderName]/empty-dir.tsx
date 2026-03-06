import { Button } from '@/components/ui/button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { FolderCode } from 'lucide-react'

export function EmptyDir() {
    return (
        <Empty>
            <EmptyHeader className="max-w-full">
                <EmptyMedia variant="icon">
                    <FolderCode />
                </EmptyMedia>
                <EmptyTitle>No files in this folder</EmptyTitle>
                <EmptyDescription className="w-full">
                    You haven&apos;t created any files yet. Get started by
                    creating your first file.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button variant="outline">Upload file</Button>
            </EmptyContent>
        </Empty>
    )
}
