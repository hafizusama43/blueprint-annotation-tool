import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type CanvasPoint = {
    x: number
    y: number
}

export type ShapeType = 'linear' | 'area'

export type AnnotationShape = {
    id: string
    pageId: string
    type: ShapeType
    points: CanvasPoint[]
    label: string
    measurement: number
    unit: string
    closed: boolean
    createdAt: number
}

type ShapesState = {
    byPageId: Record<string, AnnotationShape[]>
    selectedShapeId: string | null
}

const initialState: ShapesState = {
    byPageId: {},
    selectedShapeId: null,
}

type AddShapePayload = Omit<AnnotationShape, 'createdAt'>

const shapesSlice = createSlice({
    name: 'shapes',
    initialState,
    reducers: {
        addShape(state, action: PayloadAction<AddShapePayload>) {
            const pageShapes = state.byPageId[action.payload.pageId] ?? []
            pageShapes.push({
                ...action.payload,
                createdAt: Date.now(),
            })
            state.byPageId[action.payload.pageId] = pageShapes
        },
        deleteShape(
            state,
            action: PayloadAction<{ pageId: string; shapeId: string }>,
        ) {
            const pageShapes = state.byPageId[action.payload.pageId] ?? []
            state.byPageId[action.payload.pageId] = pageShapes.filter(
                (shape) => shape.id !== action.payload.shapeId,
            )
            if (state.selectedShapeId === action.payload.shapeId) {
                state.selectedShapeId = null
            }
        },
        updateShapeLabel(
            state,
            action: PayloadAction<{
                pageId: string
                shapeId: string
                label: string
            }>,
        ) {
            const pageShapes = state.byPageId[action.payload.pageId] ?? []
            const target = pageShapes.find(
                (shape) => shape.id === action.payload.shapeId,
            )
            if (!target) return
            target.label = action.payload.label
        },
        setSelectedShape(state, action: PayloadAction<string | null>) {
            state.selectedShapeId = action.payload
        },
        clearPageShapes(state, action: PayloadAction<{ pageId: string }>) {
            delete state.byPageId[action.payload.pageId]
            state.selectedShapeId = null
        },
    },
})

export const {
    addShape,
    deleteShape,
    updateShapeLabel,
    setSelectedShape,
    clearPageShapes,
} = shapesSlice.actions

export default shapesSlice.reducer
