import axios from 'axios'

type PresignedResponse = {
    uploadUrl: string
    method: 'PUT'
    headers: Record<string, string>
    key: string
    fileUrl: string
    expiresIn: number
}

export async function uploadFileToR2({
    file,
    onProgress,
}: {
    file: File
    onProgress?: (percent: number) => void
}) {
    const presignedRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blueprints/presigned-upload-url`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
            }),
        },
    )

    const presigned = await presignedRes.json()

    await axios.put(presigned.uploadUrl, file, {
        headers: {
            'Content-Type': file.type,
            ...presigned.headers,
        },
        onUploadProgress(event) {
            if (!onProgress) return

            const percent = Math.round(
                (event.loaded * 100) / (event.total ?? 1),
            )

            onProgress(percent)
        },
    })

    return presigned
}
