'use client'

import { Button } from '@/components/ui/button'
import { useGetFolderFilesQuery } from '@/store/features/blueprint/blueprintsApi'
import { EmptyDir } from './empty-dir'
import { FilesSkeleton } from './files-skeleton'

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

            <div className="space-y-2">
                {files.map((file) => (
                    <div
                        key={String(file.id)}
                        className="rounded-md border p-3 text-sm"
                    >
                        {file.name}
                    </div>
                ))}
            </div>
        </div>
    )
}
