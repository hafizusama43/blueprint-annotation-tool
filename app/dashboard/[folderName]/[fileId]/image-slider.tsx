'use client'

import { useEffect, useRef, memo, useState, useMemo } from 'react'
import Image from 'next/image'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDispatch, useSelector } from 'react-redux'
import {
    RootState,
    selectSelectedShapeId,
    selectShapesByPageId,
} from '@/store/index'
import { setCurrentPage } from '@/store/features/blueprint/blueprintSlice'
import { BlueprintPage } from '@/store/features/blueprint/blueprintsApi'
import { useAppSelector } from '@/store/hooks'

const THUMBNAIL_ROW_HEIGHT = 146

interface Props {
    pages: BlueprintPage[]
}

type SliderItemProps = {
    page: BlueprintPage
    index: number
    isActive: boolean
    onSelect: (index: number) => void
    pageId: string
}

const SliderItem = memo(function SliderItem({
    page,
    index,
    isActive,
    pageId,
    onSelect,
}: SliderItemProps) {
    const shapes = useAppSelector((state) =>
        selectShapesByPageId(state, pageId),
    )

    const totals = useMemo(() => {
        return {
            all: shapes.length,
            linear: shapes.filter((shape) => shape.type === 'linear').length,
            area: shapes.filter((shape) => shape.type === 'area').length,
        }
    }, [shapes])
    return (
        <div
            onClick={() => onSelect(index)}
            className={`mb-2 cursor-pointer rounded p-1 ${
                isActive
                    ? 'border-blue-500 border-2'
                    : 'border-green-500 border'
            }`}
        >
            <div className="relative h-32 w-full overflow-hidden">
                {/* Badge */}
                <span className="absolute top-1 left-1 z-10 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {page.pageNumber}
                </span>

                {totals.all > 0 && (
                    <div className="absolute bottom-1 right-1 z-10 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        Annotations: {totals.all}
                    </div>
                )}

                <Image
                    src={page.thumbnailUrl}
                    alt={`Blueprint page ${page.pageNumber} preview`}
                    fill
                    sizes="256px"
                    loading="lazy"
                    unoptimized
                    className="object-cover"
                />
            </div>
        </div>
    )
})

export default function ImageSlider({ pages }: Props) {
    const dispatch = useDispatch()
    const currentPage = useSelector(
        (state: RootState) => state.blueprint.currentPageIndex,
    )
    const parentRef = useRef<HTMLDivElement>(null)
    // TanStack Virtual is used intentionally here for large lists.
    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: pages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => THUMBNAIL_ROW_HEIGHT,
        overscan: 6,
    })

    useEffect(() => {
        if (currentPage >= 0 && currentPage < pages.length) {
            rowVirtualizer.scrollToIndex(currentPage, { align: 'auto' })
        }
    }, [currentPage, pages.length, rowVirtualizer])

    return (
        <div className="min-w-64 h-full p-2 bg-gray-100">
            <div ref={parentRef} className="h-full overflow-y-auto px-2">
                <div
                    className="relative w-full"
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                    {rowVirtualizer.getVirtualItems().map((item) => {
                        const page = pages[item.index]

                        return (
                            <div
                                key={page.id}
                                className="absolute left-0 top-0 w-full"
                                style={{
                                    transform: `translateY(${item.start}px)`,
                                }}
                            >
                                <SliderItem
                                    page={page}
                                    index={item.index}
                                    isActive={currentPage === item.index}
                                    onSelect={(index) =>
                                        dispatch(setCurrentPage(index))
                                    }
                                    pageId={page.id}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
