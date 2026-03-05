import { createSlice } from '@reduxjs/toolkit'

const calibrationSlice = createSlice({
    name: 'calibration',
    initialState: {
        id: '',
        text: '',
        completed: false,
    },
    reducers: {
        setCalibration(state, action) {
            state.id = action.payload.id
            state.text = action.payload.text
            state.completed = action.payload.completed
        },
    },
})

export const { setCalibration } = calibrationSlice.actions
export default calibrationSlice.reducer
