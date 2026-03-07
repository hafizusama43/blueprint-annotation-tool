'use client'

import { useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/index'
import { BlueprintPage } from '@/store/features/blueprint/blueprintsApi'

interface Props {
    pages: BlueprintPage[]
}

function preloadImage(src?: string) {
    if (!src) return

    const img = new window.Image()
    img.src = src
}

export default function CanvasStage({ pages }: Props) {
    const currentPage = useSelector(
        (state: RootState) => state.blueprint.currentPageIndex,
    )

    const page = pages[currentPage]

    const [img] = useImage(page?.imageUrl || '')

    useEffect(() => {
        preloadImage(pages[currentPage - 1]?.imageUrl)
        preloadImage(pages[currentPage + 1]?.imageUrl)
    }, [currentPage, pages])

    return (
        <div className="flex-1 h-full">
            <Stage width={1200} height={800}>
                <Layer>{img && <KonvaImage image={img} x={0} y={0} />}</Layer>
            </Stage>
        </div>
    )
}
