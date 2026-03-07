import { FileClient } from './file-client'

export default async function Page({
    params,
}: {
    params: Promise<{ fileId: string }>
}) {
    const { fileId } = await params
    return <FileClient fileId={fileId} />
}
