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
import Link from 'next/link'
import { UploadDialog } from '@/components/upload-dialog'

export function EmptyDir() {
    return (
        <Empty>
            <EmptyHeader className="max-w-full">
                <EmptyMedia variant="icon">
                    <FolderCode />
                </EmptyMedia>

                <EmptyTitle>No files in this folder</EmptyTitle>

                <EmptyDescription className="w-full">
                    Upload a blueprint to start annotating and measuring
                    quantities.
                </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="flex-row justify-center gap-2">
                <UploadDialog>
                    <Button variant="outline">Upload File</Button>
                </UploadDialog>

                <Link href="/dashboard">
                    <Button variant="outline">Back to dashboard</Button>
                </Link>
            </EmptyContent>
        </Empty>
    )
}
