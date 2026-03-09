'use client'

import { useEffect } from 'react'
import { useGetByIdQuery } from '@/store/features/blueprint/blueprintsApi'
import { setCurrentPage } from '@/store/features/blueprint/blueprintSlice'
import { useAppDispatch } from '@/store/hooks'
import ImageSlider from './image-slider'
import CanvasStage from './canvas-stage'
import ViewerLoading from './viewer-loading'

export function FileClient({ fileId }: { fileId: string }) {
    const dispatch = useAppDispatch()
    const { data: file, isLoading } = useGetByIdQuery(fileId)

    useEffect(() => {
        // Route switched to a different file, start on first page.
        dispatch(setCurrentPage(0))
    }, [dispatch, fileId])

    if (isLoading) return <ViewerLoading />
    if (!file) return <div>File not found</div>

    const pages = file.pages ?? []

    return (
        <div className="flex h-[calc(100vh-62px)] max-h-[calc(100vh-3rem)] overflow-hidden rounded-xl ">
            <ImageSlider pages={pages} />
            <CanvasStage key={fileId} pages={pages} />
        </div>
    )
}
