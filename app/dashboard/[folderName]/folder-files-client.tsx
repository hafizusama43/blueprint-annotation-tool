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
import {
    useDeleteFileMutation,
    useGetFolderFilesQuery,
} from '@/store/features/blueprint/blueprintsApi'
import { EmptyDir } from './empty-dir'
import { TableLoading } from './table-loading'
import { formatFileSize, formatCreatedAt, getFileTypeLabel } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash } from 'lucide-react'
import { UploadDialog } from '@/components/upload-dialog'

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
    } = useGetFolderFilesQuery(folderName, {
        // pollingInterval: 3000,
        // skipPollingIfUnfocused: true,
    })
    const [deleteFile] = useDeleteFileMutation()
    const { refetch: refetchFolderFiles } = useGetFolderFilesQuery('blueprints')
    if (isLoading) {
        return <TableLoading />
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

    const handleDelete = async (id: string | number) => {
        try {
            await deleteFile(String(id)).unwrap()
            await refetchFolderFiles()
        } catch (error) {
            console.error(error)
        }
    }

    if (files.length === 0) {
        return <EmptyDir />
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight capitalize">
                            {folderName}
                        </h1>
                        <h1 className="text-2xl font-semibold tracking-tight capitalize">
                            {folderName}
                        </h1>
                        <UploadDialog>
                            <Button variant="outline" size="icon">
                                <Plus className="size-5" />
                            </Button>
                        </UploadDialog>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge className="rounded-md px-2 py-0.5">
                            {files.length}
                            <span>file{files.length === 1 ? '' : 's'}</span>
                        </Badge>
                    </div>
                </div>
                {isFetching ? (
                    <span className="text-sm text-blue-500">
                        <Spinner />
                    </span>
                ) : null}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
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
                                {file.processingStatus}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {formatCreatedAt(file.createdAt)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        void handleDelete(file.id)
                                    }}
                                >
                                    <Trash className="size-5" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
