import { FolderFilesClient } from './folder-files-client'

export default async function Page({
    params,
}: {
    params: Promise<{ folderName: string }>
}) {
    const { folderName } = await params

    return <FolderFilesClient folderName={folderName} />
}
