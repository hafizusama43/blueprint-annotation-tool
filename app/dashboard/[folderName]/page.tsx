import { EmptyDir } from './empty-dir'

const files: { id: number; name: string }[] = []

export default async function Page({
    params,
}: {
    params: { folderName: string }
}) {
    const { folderName } = await params
    return (
        <div>
            {files.length > 0 ? (
                <div>
                    {files.map((file) => (
                        <div key={file.id}>{file.name}</div>
                    ))}
                </div>
            ) : (
                <EmptyDir />
            )}
        </div>
    )
}
