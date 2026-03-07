'use client'

import { useGetByIdQuery } from '@/store/features/blueprint/blueprintsApi'
import ImageSlider from './image-slider'
import CanvasStage from './canvas-stage'
import ViewerLoading from './viewer-loading'

export function FileClient({ fileId }: { fileId: string }) {
    const { data: file, isLoading } = useGetByIdQuery(fileId)

    if (isLoading) return <ViewerLoading />
    if (!file) return <div>File not found</div>

    const pages = file.pages ?? []

    return (
        <div className="flex h-[calc(100vh-62px)] max-h-[calc(100vh-3rem)] overflow-hidden rounded-xl ">
            <ImageSlider pages={pages} />
            <CanvasStage pages={pages} />
        </div>
    )
}
