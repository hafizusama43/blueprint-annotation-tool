import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number | undefined): string {
    if (bytes == null) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatCreatedAt(iso: string | undefined): string {
    if (!iso) return '—'
    try {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return iso
        return d.toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'short',
        })
    } catch {
        return iso
    }
}

export function getFileTypeLabel(mimeType: string | undefined): string {
    if (!mimeType) return '—'
    const parts = mimeType.split('/')
    return parts[parts.length - 1]?.toUpperCase() ?? mimeType
}

export function getErrorMessage(error: unknown) {
    if (!error || typeof error !== 'object') {
        return 'An unknown error occurred.'
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

    return 'An unknown error occurred.'
}
