import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type FolderFileApiRecord = {
    id?: string | number
    _id?: string | number
    name?: string
    fileName?: string
    filename?: string
    originalName?: string
    originalFileName?: string
    title?: string
    url?: string
    fileUrl?: string
    mimeType?: string
    fileSizeBytes?: number
    createdAt?: string
    updatedAt?: string
    processingStatus?: 'PROCESSING' | 'READY' | 'FAILED'
}

type FolderFilesResponse =
    | FolderFileApiRecord[]
    | {
          data?: FolderFileApiRecord[]
          files?: FolderFileApiRecord[]
          items?: FolderFileApiRecord[]
      }

export type FolderFile = {
    id: string | number
    name: string
    url?: string
    mimeType?: string
    fileSizeBytes?: number
    createdAt?: string
    processingStatus?: 'PROCESSING' | 'READY' | 'FAILED' | 'PENDING'
}

function getFileName(file: FolderFileApiRecord) {
    return (
        file.name ??
        file.originalFileName ??
        file.fileName ??
        file.filename ??
        file.originalName ??
        file.title ??
        'Untitled file'
    )
}

function normalizeFiles(response: FolderFilesResponse): FolderFile[] {
    const files = Array.isArray(response)
        ? response
        : (response.files ?? response.data ?? response.items ?? [])

    return files.map((file, index) => ({
        id: file.id ?? file._id ?? `${getFileName(file)}-${index}`,
        name: getFileName(file),
        url: file.fileUrl ?? file.url,
        mimeType: file.mimeType,
        fileSizeBytes: file.fileSizeBytes,
        createdAt: file.createdAt,
        processingStatus: file.processingStatus,
    }))
}

export const blueprintsApi = createApi({
    reducerPath: 'blueprintsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
    }),
    tagTypes: ['FolderFiles'],
    endpoints: (builder) => ({
        getFolderFiles: builder.query<FolderFile[], string>({
            query: (folderName) => ({
                url: `/${encodeURIComponent(folderName)}`,
            }),
            transformResponse: (response: FolderFilesResponse) =>
                normalizeFiles(response),
            providesTags: (_result, _error, folderName) => [
                { type: 'FolderFiles', id: folderName },
            ],
        }),
        deleteFile: builder.mutation<void, string>({
            query: (id) => ({
                url: `blueprints/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'FolderFiles', id },
            ],
        }),
        uploadFile: builder.mutation<
            void,
            {
                key: string
                originalFileName: string
                fileUrl: string
                name: string
            }
        >({
            query: (data) => ({
                url: `blueprints/upload`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, data) => [
                { type: 'FolderFiles', id: data.name },
            ],
        }),
        processFile: builder.mutation<void, string>({
            query: (id) => ({
                url: `blueprints/${id}/process`,
                method: 'PUT',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'FolderFiles', id },
            ],
        }),
    }),
})
export const {
    useGetFolderFilesQuery,
    useDeleteFileMutation,
    useUploadFileMutation,
    useProcessFileMutation,
} = blueprintsApi
