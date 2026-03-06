'use client'

import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'

import { UploadCloud, CheckCircle } from 'lucide-react'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { uploadFileToR2 } from '@/lib/uploadFileToR2'
import {
    useGetFolderFilesQuery,
    useUploadFileMutation,
} from '@/store/features/blueprint/blueprintsApi'
import { formatFileSize } from '@/lib/utils'

type UploadDialogProps = {
    children: React.ReactNode
}

export function UploadDialog({ children }: UploadDialogProps) {
    const fileInputId = useId()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [progress, setProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [uploadFile] = useUploadFileMutation()
    const { refetch: refetchFolderFiles } = useGetFolderFilesQuery('blueprints')
    const resetUpload = () => {
        setFile(null)
        setProgress(0)
        setUploading(false)
        setSuccess(false)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetUpload()
        }

        setOpen(nextOpen)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) setFile(selected)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) setFile(droppedFile)
    }

    const handleUpload = async () => {
        if (!file) return

        try {
            setUploading(true)
            setProgress(0)

            const uploadResult = await uploadFileToR2({
                file,
                onProgress: (percent) => setProgress(percent),
            })

            await uploadFile({
                key: uploadResult.key,
                originalFileName: file.name,
                fileUrl: uploadResult.fileUrl,
                name: file.name,
            })
            await refetchFolderFiles()
            setSuccess(true)
        } catch (error) {
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Blueprint</DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <p className="text-sm font-medium">
                            Blueprint uploaded successfully
                        </p>

                        <Button onClick={resetUpload}>
                            Upload Another File
                        </Button>
                    </div>
                ) : (
                    <>
                        {uploading && (
                            <div className="mt-4 space-y-2">
                                <Progress value={progress} />
                                <p className="text-xs text-muted-foreground text-center">
                                    Uploading {progress}%
                                </p>
                            </div>
                        )}

                        {!uploading && (
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/40 transition"
                            >
                                <UploadCloud className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

                                <p className="text-sm text-muted-foreground mb-2">
                                    Drag & drop your PDF blueprint here
                                </p>

                                <p className="text-xs text-muted-foreground mb-4">
                                    or browse files
                                </p>

                                <input
                                    id={fileInputId}
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <label htmlFor={fileInputId}>
                                    <Button
                                        asChild
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <span>Browse File</span>
                                    </Button>
                                </label>

                                {file && (
                                    <>
                                        <Separator className="my-4" />

                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm font-medium">
                                                Selected: {file.name}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!success && (
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetUpload}
                                    disabled={uploading}
                                >
                                    Clear
                                </Button>

                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                >
                                    Upload
                                </Button>
                            </DialogFooter>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
