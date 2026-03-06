import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type FolderFileApiRecord = {
    id?: string | number
    _id?: string | number
    name?: string
    fileName?: string
    filename?: string
    originalName?: string
    title?: string
    url?: string
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
}

function getFileName(file: FolderFileApiRecord) {
    return (
        file.name ??
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
        url: file.url,
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
    }),
})

export const { useGetFolderFilesQuery } = blueprintsApi
