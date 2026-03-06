'use client'

import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useGetFolderFilesQuery } from '@/store/features/blueprint/blueprintsApi'
import { EmptyDir } from './empty-dir'
import { FilesSkeleton } from './files-skeleton'
import { formatFileSize, formatCreatedAt, getFileTypeLabel } from '@/lib/utils'

function getErrorMessage(error: unknown) {
    if (!error || typeof error !== 'object') {
        return 'Failed to load files for this folder.'
    }

    if ('data' in error) {
        const errorData = error.data

        if (typeof errorData === 'string') {
            return errorData
        }

        if (
            errorData &&
            typeof errorData === 'object' &&
            'message' in errorData &&
            typeof errorData.message === 'string'
        ) {
            return errorData.message
        }
    }

    return 'Failed to load files for this folder.'
}

export function FolderFilesClient({ folderName }: { folderName: string }) {
    const {
        data: files = [],
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetFolderFilesQuery(folderName)

    if (isLoading) {
        return <FilesSkeleton />
    }

    if (isError) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">
                    {getErrorMessage(error)}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                    Retry
                </Button>
            </div>
        )
    }

    if (files.length === 0) {
        return <EmptyDir />
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold capitalize">
                        {folderName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {files.length} file{files.length === 1 ? '' : 's'}
                    </p>
                </div>
                {isFetching ? (
                    <span className="text-sm text-muted-foreground">
                        Refreshing...
                    </span>
                ) : null}
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
                    {files.map((file) => (
                        <TableRow key={String(file.id)}>
                            <TableCell className="font-medium">
                                {file.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {getFileTypeLabel(file.mimeType)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatFileSize(file.fileSizeBytes)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatCreatedAt(file.createdAt)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
