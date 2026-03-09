import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlueprintViewerState {
    currentPageIndex: number
    defaultZoom: number
    defaultPosition: { x: number, y: number }
}

const initialState: BlueprintViewerState = {
    currentPageIndex: 0,
    defaultZoom: 1,
    defaultPosition: { x: 0, y: 0 },
}

const blueprintViewerSlice = createSlice({
    name: 'blueprint',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPageIndex = action.payload
        },
        setDefaultZoom: (state, action: PayloadAction<number>) => {
            state.defaultZoom = action.payload
        },
        setDefaultPosition: (state, action: PayloadAction<{ x: number, y: number }>) => {
            state.defaultPosition = action.payload
        },
    },
})

export const { setCurrentPage, setDefaultZoom, setDefaultPosition } = blueprintViewerSlice.actions
export default blueprintViewerSlice.reducer
