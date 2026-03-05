import { createSlice } from '@reduxjs/toolkit'

const canvasSlice = createSlice({
    name: 'canvas',
    initialState: {
        canvas: null,
    },
    reducers: {
        setCanvas(state, action) {
            state.canvas = action.payload.canvas
        },
    },
})

export const { setCanvas } = canvasSlice.actions
export default canvasSlice.reducer
