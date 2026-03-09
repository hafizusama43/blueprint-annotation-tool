'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Konva from 'konva'
import {
    Circle,
    Group,
    Layer,
    Line,
    Stage,
    Text,
    Image as KonvaImage,
} from 'react-konva'
import useImage from 'use-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { BlueprintPage } from '@/store/features/blueprint/blueprintsApi'
import {
    clearCalibrationLine,
    setCalibration,
    setCalibrationLine,
} from '@/store/features/calibration/calibrationSlice'
import {
    addShape,
    CanvasPoint,
    setSelectedShape,
    ShapeType,
} from '@/store/features/shapes/shapesSlice'
import {
    RootState,
    selectCalibrationByPageId,
    selectSelectedShapeId,
    selectShapesByPageId,
} from '@/store/index'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import AnnotationsPanel from './annotations-panel'
import { LucideLineDotRightHorizontal, Move, Scale, Square } from 'lucide-react'

interface Props {
    pages: BlueprintPage[]
}

type ToolMode = 'pan' | 'calibrate' | 'linear' | 'area'

type PerfMonitor = {
    heapMb: number | null
    nodeCount: number
}

function preloadImage(src?: string) {
    if (!src) return

    const img = new window.Image()
    img.src = src
}

function getDistance(a: CanvasPoint, b: CanvasPoint) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
}

function getPolylineLength(points: CanvasPoint[]) {
    if (points.length < 2) return 0
    let sum = 0
    for (let i = 1; i < points.length; i += 1) {
        sum += getDistance(points[i - 1], points[i])
    }
    return sum
}

function getPolygonArea(points: CanvasPoint[]) {
    if (points.length < 3) return 0
    let area = 0
    for (let i = 0; i < points.length; i += 1) {
        const j = (i + 1) % points.length
        area += points[i].x * points[j].y - points[j].x * points[i].y
    }
    return Math.abs(area / 2)
}

function flattenPoints(points: CanvasPoint[]) {
    return points.flatMap((point) => [point.x, point.y])
}

function getLabelPoint(points: CanvasPoint[]) {
    if (points.length === 0) return { x: 0, y: 0 }
    if (points.length === 1) return points[0]

    if (points.length === 2) {
        return {
            x: (points[0].x + points[1].x) / 2,
            y: (points[0].y + points[1].y) / 2,
        }
    }

    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length
    const y = points.reduce((sum, point) => sum + point.y, 0) / points.length
    return { x, y }
}

export default function CanvasStage({ pages }: Props) {
    const dispatch = useAppDispatch()
    const currentPage = useAppSelector(
        (state: RootState) => state.blueprint.currentPageIndex,
    )
    const page = pages[currentPage]
    const pageId = page?.id ?? ''
    const shapes = useAppSelector((state) =>
        selectShapesByPageId(state, pageId),
    )
    const selectedShapeId = useAppSelector(selectSelectedShapeId)
    const calibration = useAppSelector((state) =>
        selectCalibrationByPageId(state, pageId),
    )
    const [img] = useImage(page?.imageUrl || '')
    const stageRef = useRef<Konva.Stage | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [toolMode, setToolMode] = useState<ToolMode>('pan')
    const [draftPoints, setDraftPoints] = useState<CanvasPoint[]>([])
    const [calibrationDraft, setCalibrationDraft] = useState<CanvasPoint[]>([])
    const [showCalibrationDialog, setShowCalibrationDialog] = useState(false)
    const [distanceInput, setDistanceInput] = useState('10')
    const [unitInput, setUnitInput] = useState('m')
    const [stageSize, setStageSize] = useState({ width: 1200, height: 800 })
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [cursor, setCursor] = useState<CanvasPoint | null>(null)
    const [perfMonitor, setPerfMonitor] = useState<PerfMonitor>({
        heapMb: null,
        nodeCount: 0,
    })
    const isDev = process.env.NODE_ENV !== 'production'

    useEffect(() => {
        preloadImage(pages[currentPage - 1]?.imageUrl)
        preloadImage(pages[currentPage + 1]?.imageUrl)
    }, [currentPage, pages])

    useEffect(() => {
        // Reset transient interaction state when switching pages.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftPoints([])
        setCalibrationDraft([])
        setShowCalibrationDialog(false)
        setCursor(null)
        dispatch(setSelectedShape(null))
    }, [dispatch, pageId])

    useEffect(() => {
        if (!page) return
        if (!containerRef.current) return
        const fitScale = Math.min(
            stageSize.width / page.width,
            stageSize.height / page.height,
        )

        const nextScale = Number.isFinite(fitScale) ? fitScale : 1
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setScale(nextScale)
        const nextPosition = {
            x: (stageSize.width - page.width * nextScale) / 2,
            y: (stageSize.height - page.height * nextScale) / 2,
        }
        setPosition(nextPosition)
    }, [page, stageSize.height, stageSize.width])

    useEffect(() => {
        const element = containerRef.current
        if (!element) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            setStageSize({
                width: Math.max(200, Math.floor(entry.contentRect.width)),
                height: Math.max(200, Math.floor(entry.contentRect.height)),
            })
        })

        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    const convertPointerToImagePoint = useCallback(
        (stage: Konva.Stage) => {
            const pointer = stage.getPointerPosition()
            if (!pointer) return null
            return {
                x: (pointer.x - position.x) / scale,
                y: (pointer.y - position.y) / scale,
            }
        },
        [position.x, position.y, scale],
    )

    const finalizeShape = useCallback(
        (shapeType: ShapeType) => {
            if (!pageId) return
            if (shapeType === 'linear' && draftPoints.length < 2) return
            if (shapeType === 'area' && draftPoints.length < 3) return

            const measurementPx =
                shapeType === 'linear'
                    ? getPolylineLength(draftPoints)
                    : getPolygonArea(draftPoints)
            const calibratedPixelPerUnit = calibration?.pixelPerUnit
            const hasCalibration =
                calibratedPixelPerUnit !== null &&
                calibratedPixelPerUnit !== undefined &&
                calibratedPixelPerUnit > 0
            let measurement = measurementPx
            if (hasCalibration) {
                measurement =
                    shapeType === 'linear'
                        ? measurementPx / calibratedPixelPerUnit
                        : measurementPx /
                          (calibratedPixelPerUnit * calibratedPixelPerUnit)
            }
            const baseUnit = hasCalibration
                ? (calibration?.unitLabel ?? 'm')
                : 'px'
            const unit = shapeType === 'area' ? `${baseUnit}²` : baseUnit

            dispatch(
                addShape({
                    id: `${shapeType}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    pageId,
                    type: shapeType,
                    points: draftPoints,
                    label:
                        shapeType === 'area'
                            ? `Area ${shapes.length + 1}`
                            : `Linear ${shapes.length + 1}`,
                    measurement,
                    unit,
                    closed: shapeType === 'area',
                }),
            )
            setDraftPoints([])
        },
        [
            calibration?.pixelPerUnit,
            calibration?.unitLabel,
            dispatch,
            draftPoints,
            pageId,
            shapes.length,
        ],
    )

    useEffect(() => {
        const handleEnterToFinish = (event: KeyboardEvent) => {
            if (event.key !== 'Enter') return
            if (toolMode === 'linear' && draftPoints.length > 1) {
                event.preventDefault()
                finalizeShape('linear')
            }
            if (toolMode === 'area' && draftPoints.length > 2) {
                event.preventDefault()
                finalizeShape('area')
            }
        }
        window.addEventListener('keydown', handleEnterToFinish)
        return () => window.removeEventListener('keydown', handleEnterToFinish)
    }, [draftPoints, finalizeShape, toolMode])

    useEffect(() => {
        if (!isDev) return

        const sample = () => {
            const stage = stageRef.current
            const nodeCount = stage?.find('*').length ?? 0
            const perf = performance as Performance & {
                memory?: { usedJSHeapSize?: number }
            }
            const usedHeap = perf.memory?.usedJSHeapSize

            setPerfMonitor({
                heapMb:
                    typeof usedHeap === 'number'
                        ? usedHeap / (1024 * 1024)
                        : null,
                nodeCount,
            })
        }

        sample()
        const intervalId = window.setInterval(sample, 1000)
        return () => window.clearInterval(intervalId)
    }, [isDev, pageId])

    const onStageMouseDown = useCallback(() => {
        const stage = stageRef.current
        if (!stage) return
        if (!page) return
        if (toolMode === 'pan') return

        const point = convertPointerToImagePoint(stage)
        if (!point) return

        if (toolMode === 'calibrate') {
            if (calibrationDraft.length === 0) {
                setCalibrationDraft([point])
                return
            }
            const next = [calibrationDraft[0], point]
            setCalibrationDraft(next)
            dispatch(
                setCalibrationLine({
                    pageId,
                    linePoints: [next[0], next[1]],
                }),
            )
            setShowCalibrationDialog(true)
            return
        }

        if (toolMode === 'linear' || toolMode === 'area') {
            setDraftPoints((prev) => [...prev, point])
        }
    }, [
        calibrationDraft,
        convertPointerToImagePoint,
        dispatch,
        page,
        pageId,
        toolMode,
    ])

    const onStageMouseMove = useCallback(() => {
        const stage = stageRef.current
        if (!stage) return
        const point = convertPointerToImagePoint(stage)
        setCursor(point)
    }, [convertPointerToImagePoint])

    const onWheel = useCallback(
        (event: Konva.KonvaEventObject<WheelEvent>) => {
            event.evt.preventDefault()
            const stage = stageRef.current
            if (!stage) return
            const pointer = stage.getPointerPosition()
            if (!pointer) return

            const scaleBy = 1.05
            const oldScale = scale
            const direction = event.evt.deltaY > 0 ? -1 : 1
            const nextScale =
                direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
            const clamped = Math.max(0.1, Math.min(8, nextScale))
            const mousePointTo = {
                x: (pointer.x - position.x) / oldScale,
                y: (pointer.y - position.y) / oldScale,
            }
            const nextPosition = {
                x: pointer.x - mousePointTo.x * clamped,
                y: pointer.y - mousePointTo.y * clamped,
            }
            setScale(clamped)
            setPosition(nextPosition)
        },
        [position.x, position.y, scale],
    )

    const calibrationLinePoints = calibration?.linePoints ?? null
    const calibrationLabelPoint = calibrationLinePoints
        ? getLabelPoint(calibrationLinePoints)
        : null
    const cursorWorld =
        cursor && calibration?.pixelPerUnit
            ? {
                  x: cursor.x / calibration.pixelPerUnit,
                  y: cursor.y / calibration.pixelPerUnit,
              }
            : null

    const renderedShapes = useMemo(() => {
        return shapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId
            const labelPoint = getLabelPoint(shape.points)
            return (
                <Group
                    key={shape.id}
                    onClick={() => dispatch(setSelectedShape(shape.id))}
                >
                    <Line
                        points={flattenPoints(shape.points)}
                        closed={shape.closed}
                        fill={
                            shape.type === 'area'
                                ? isSelected
                                    ? 'rgba(37,99,235,0.3)'
                                    : 'rgba(37,99,235,0.2)'
                                : undefined
                        }
                        stroke={isSelected ? '#1d4ed8' : '#111827'}
                        strokeWidth={isSelected ? 3 : 2}
                        lineJoin="round"
                        lineCap="round"
                    />
                    <Text
                        x={labelPoint.x + 8}
                        y={labelPoint.y + 8}
                        text={`${shape.label}: ${shape.measurement.toFixed(2)} ${shape.unit}`}
                        fontSize={14}
                        fill="#111827"
                    />
                </Group>
            )
        })
    }, [dispatch, selectedShapeId, shapes])

    if (!page) {
        return <div className="flex-1 h-full p-4">No pages found.</div>
    }

    return (
        <div className="flex-1 h-full flex bg-gray-100 overflow-hidden">
            <div className="flex-1 min-w-0 h-full p-2 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between rounded-md bg-white border border-gray-200 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            tooltipText="Pan"
                            size="icon"
                            variant={toolMode === 'pan' ? 'default' : 'outline'}
                            onClick={() => {
                                setToolMode('pan')
                                setDraftPoints([])
                            }}
                        >
                            <Move />
                        </Button>
                        <Button
                            tooltipText="Calibrate Scale"
                            size="icon"
                            variant={
                                toolMode === 'calibrate' ? 'default' : 'outline'
                            }
                            onClick={() => {
                                setToolMode('calibrate')
                                setDraftPoints([])
                                setCalibrationDraft([])
                            }}
                        >
                            <Scale />
                        </Button>
                        <Button
                            tooltipText="Linear"
                            size="icon"
                            variant={
                                toolMode === 'linear' ? 'default' : 'outline'
                            }
                            onClick={() => setToolMode('linear')}
                        >
                            <LucideLineDotRightHorizontal />
                        </Button>
                        <Button
                            tooltipText="Area"
                            size="icon"
                            variant={
                                toolMode === 'area' ? 'default' : 'outline'
                            }
                            onClick={() => setToolMode('area')}
                        >
                            <Square />
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Page: {currentPage + 1}</Badge>
                        <Badge variant="outline">
                            Zoom: {(scale * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline">
                            Cursor(px):{' '}
                            {cursor
                                ? `${cursor.x.toFixed(1)}, ${cursor.y.toFixed(1)}`
                                : '-'}
                        </Badge>
                        <Badge variant="outline">
                            Cursor(real):{' '}
                            {cursorWorld
                                ? `${cursorWorld.x.toFixed(2)}, ${cursorWorld.y.toFixed(2)} ${calibration?.unitLabel ?? ''}`
                                : 'not calibrated'}
                        </Badge>
                        {isDev && (
                            <>
                                <Badge variant="outline">
                                    Heap:{' '}
                                    {perfMonitor.heapMb !== null
                                        ? `${perfMonitor.heapMb.toFixed(1)} MB`
                                        : 'n/a'}
                                </Badge>
                                <Badge variant="outline">
                                    Nodes: {perfMonitor.nodeCount}
                                </Badge>
                            </>
                        )}
                    </div>
                </div>
                <div
                    ref={containerRef}
                    className="flex-1 min-w-0 rounded-md border border-gray-200 bg-white overflow-hidden"
                >
                    <Stage
                        key={pageId}
                        ref={stageRef}
                        width={stageSize.width}
                        height={stageSize.height}
                        draggable={toolMode === 'pan'}
                        x={position.x}
                        y={position.y}
                        scaleX={scale}
                        scaleY={scale}
                        onWheel={onWheel}
                        onMouseDown={onStageMouseDown}
                        onDblClick={() => {
                            if (
                                toolMode === 'linear' &&
                                draftPoints.length > 1
                            ) {
                                finalizeShape('linear')
                            }
                            if (toolMode === 'area' && draftPoints.length > 2) {
                                finalizeShape('area')
                            }
                        }}
                        onMouseMove={onStageMouseMove}
                        onDragEnd={(event) =>
                            setPosition({
                                x: event.target.x(),
                                y: event.target.y(),
                            })
                        }
                    >
                        <Layer>
                            {img && (
                                <KonvaImage
                                    image={img}
                                    x={0}
                                    y={0}
                                    width={page.width}
                                    height={page.height}
                                    listening={false}
                                />
                            )}
                            {renderedShapes}
                            {draftPoints.length > 0 && (
                                <Line
                                    points={flattenPoints(draftPoints)}
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    closed={toolMode === 'area'}
                                    fill={
                                        toolMode === 'area'
                                            ? 'rgba(22,163,74,0.2)'
                                            : undefined
                                    }
                                    dash={[8, 4]}
                                />
                            )}
                            {draftPoints.map((point, index) => (
                                <Circle
                                    key={`${point.x}-${point.y}-${index}`}
                                    x={point.x}
                                    y={point.y}
                                    radius={4}
                                    fill="#16a34a"
                                />
                            ))}
                            {calibrationLinePoints && (
                                <>
                                    <Line
                                        points={flattenPoints(
                                            calibrationLinePoints,
                                        )}
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        dash={[6, 3]}
                                    />
                                    {calibrationLabelPoint && (
                                        <Text
                                            x={calibrationLabelPoint.x + 8}
                                            y={calibrationLabelPoint.y + 8}
                                            text={
                                                calibration?.label ||
                                                'Calibration line'
                                            }
                                            fontSize={14}
                                            fill="#c2410c"
                                        />
                                    )}
                                </>
                            )}
                        </Layer>
                    </Stage>
                </div>
            </div>
            <AnnotationsPanel pageId={pageId} />
            <Dialog
                open={showCalibrationDialog}
                onOpenChange={(open) => {
                    setShowCalibrationDialog(open)
                    if (!open) {
                        setCalibrationDraft([])
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set scale calibration</DialogTitle>
                        <DialogDescription>
                            Enter the known real-world distance for the selected
                            line.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label
                                htmlFor="distance"
                                className="text-sm font-medium"
                            >
                                Distance
                            </label>
                            <input
                                id="distance"
                                type="number"
                                min="0"
                                step="0.01"
                                value={distanceInput}
                                onChange={(event) =>
                                    setDistanceInput(event.target.value)
                                }
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label
                                htmlFor="unit"
                                className="text-sm font-medium"
                            >
                                Unit
                            </label>
                            <input
                                id="unit"
                                value={unitInput}
                                onChange={(event) =>
                                    setUnitInput(event.target.value)
                                }
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                placeholder="m, ft, in"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                dispatch(clearCalibrationLine({ pageId }))
                                setCalibrationDraft([])
                                setShowCalibrationDialog(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (calibrationDraft.length < 2) return
                                const pixels = getDistance(
                                    calibrationDraft[0],
                                    calibrationDraft[1],
                                )
                                const realDistance = Number(distanceInput)
                                if (
                                    !pixels ||
                                    !realDistance ||
                                    realDistance <= 0
                                ) {
                                    return
                                }
                                const pixelPerUnit = pixels / realDistance
                                dispatch(
                                    setCalibration({
                                        pageId,
                                        pixelPerUnit,
                                        unitLabel: unitInput.trim() || 'm',
                                        realWorldDistance: realDistance,
                                        label: `${realDistance} ${unitInput.trim() || 'm'}`,
                                    }),
                                )
                                setShowCalibrationDialog(false)
                                setCalibrationDraft([])
                            }}
                        >
                            Save calibration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
