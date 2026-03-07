'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    deleteShape,
    setSelectedShape,
    updateShapeLabel,
} from '@/store/features/shapes/shapesSlice'
import { selectSelectedShapeId, selectShapesByPageId } from '@/store/index'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

type Props = {
    pageId: string
}

function formatMeasurement(value: number, unit: string) {
    if (!Number.isFinite(value)) return `0 ${unit}`
    return `${value.toFixed(2)} ${unit}`
}

export default function AnnotationsPanel({ pageId }: Props) {
    const dispatch = useAppDispatch()
    const shapes = useAppSelector((state) =>
        selectShapesByPageId(state, pageId),
    )
    const selectedShapeId = useAppSelector(selectSelectedShapeId)
    const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({})

    const totals = useMemo(() => {
        return {
            all: shapes.length,
            linear: shapes.filter((shape) => shape.type === 'linear').length,
            area: shapes.filter((shape) => shape.type === 'area').length,
        }
    }, [shapes])

    return (
        <aside className="w-60 h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Annotations</h2>
                    <Badge variant="outline">{totals.all}</Badge>
                </div>
                <div className="flex gap-2 text-xs text-gray-600">
                    <Badge variant="secondary">Linear: {totals.linear}</Badge>
                    <Badge variant="secondary">Area: {totals.area}</Badge>
                </div>
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {shapes.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No shapes yet. Use Linear or Area tools to start
                        measuring.
                    </p>
                ) : (
                    shapes.map((shape, index) => {
                        const active = shape.id === selectedShapeId
                        return (
                            <div
                                key={shape.id}
                                className={`rounded-md border p-2 space-y-2 ${
                                    active
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'
                                }`}
                                onClick={() =>
                                    dispatch(setSelectedShape(shape.id))
                                }
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <Badge
                                        variant={
                                            shape.type === 'area'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {shape.type === 'area'
                                            ? 'Area'
                                            : 'Linear'}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        #{index + 1}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={labelDrafts[shape.id] ?? ''}
                                    onChange={(event) =>
                                        setLabelDrafts((prev) => ({
                                            ...prev,
                                            [shape.id]: event.target.value,
                                        }))
                                    }
                                    onBlur={() =>
                                        dispatch(
                                            updateShapeLabel({
                                                pageId,
                                                shapeId: shape.id,
                                                label:
                                                    labelDrafts[shape.id] ??
                                                    shape.label,
                                            }),
                                        )
                                    }
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {formatMeasurement(
                                            shape.measurement,
                                            shape.unit,
                                        )}
                                    </span>
                                    <Button
                                        size="xs"
                                        variant="destructive"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            dispatch(
                                                deleteShape({
                                                    pageId,
                                                    shapeId: shape.id,
                                                }),
                                            )
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </aside>
    )
}
