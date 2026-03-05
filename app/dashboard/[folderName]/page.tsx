export default async function Page({ params }: { params: { folderName: string } }) {
    const { folderName } = await params
    return (
        <div>
            <h1>{folderName}</h1>
        </div>
    )
}