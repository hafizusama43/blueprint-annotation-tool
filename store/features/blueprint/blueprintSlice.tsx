import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlueprintViewerState {
    currentPageIndex: number
}

const initialState: BlueprintViewerState = {
    currentPageIndex: 0,
}

const blueprintViewerSlice = createSlice({
    name: 'blueprint',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPageIndex = action.payload
        },
    },
})

export const { setCurrentPage } = blueprintViewerSlice.actions
export default blueprintViewerSlice.reducer
