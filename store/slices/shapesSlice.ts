import { createSlice } from '@reduxjs/toolkit'

const shapesSlice = createSlice({
    name: 'shapes',
    initialState: {
        shapes: [],
    },
    reducers: {
        setShapes(state, action) {
            state.shapes = action.payload.shapes
        },
    },
})

export const { setShapes } = shapesSlice.actions
export default shapesSlice.reducer
