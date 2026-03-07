import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CanvasPoint } from '@/store/features/shapes/shapesSlice'

export type CalibrationPageState = {
    pixelPerUnit: number | null
    unitLabel: string
    linePoints: [CanvasPoint, CanvasPoint] | null
    realWorldDistance: number | null
    label: string
}

type CalibrationState = {
    byPageId: Record<string, CalibrationPageState>
    lastDistance: number | null
    lastUnitLabel: string
}

const defaultCalibration: CalibrationPageState = {
    pixelPerUnit: null,
    unitLabel: 'm',
    linePoints: null,
    realWorldDistance: null,
    label: '',
}

const initialState: CalibrationState = {
    byPageId: {},
    lastDistance: null,
    lastUnitLabel: 'm',
}

const calibrationSlice = createSlice({
    name: 'calibration',
    initialState,
    reducers: {
        setCalibrationLine(
            state,
            action: PayloadAction<{
                pageId: string
                linePoints: [CanvasPoint, CanvasPoint]
            }>,
        ) {
            const current = state.byPageId[action.payload.pageId] ?? {
                ...defaultCalibration,
            }
            state.byPageId[action.payload.pageId] = {
                ...current,
                linePoints: action.payload.linePoints,
            }
        },
        setCalibration(
            state,
            action: PayloadAction<{
                pageId: string
                pixelPerUnit: number
                unitLabel: string
                realWorldDistance: number
                label: string
            }>,
        ) {
            const current = state.byPageId[action.payload.pageId] ?? {
                ...defaultCalibration,
            }
            state.byPageId[action.payload.pageId] = {
                ...current,
                pixelPerUnit: action.payload.pixelPerUnit,
                unitLabel: action.payload.unitLabel,
                realWorldDistance: action.payload.realWorldDistance,
                label: action.payload.label,
            }
            state.lastDistance = action.payload.realWorldDistance
            state.lastUnitLabel = action.payload.unitLabel
        },
        clearCalibrationLine(state, action: PayloadAction<{ pageId: string }>) {
            const current = state.byPageId[action.payload.pageId] ?? {
                ...defaultCalibration,
            }
            state.byPageId[action.payload.pageId] = {
                ...current,
                linePoints: null,
            }
        },
        clearCalibration(state, action: PayloadAction<{ pageId: string }>) {
            state.byPageId[action.payload.pageId] = { ...defaultCalibration }
        },
    },
})

export const {
    setCalibration,
    setCalibrationLine,
    clearCalibrationLine,
    clearCalibration,
} = calibrationSlice.actions
export default calibrationSlice.reducer
