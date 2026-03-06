import { createSlice } from '@reduxjs/toolkit'

const blueprintSlice = createSlice({
    name: 'blueprint',
    initialState: {
        files: [],
    },
    reducers: {
        setFiles(state, action) {
            state.files = action.payload.files
        },
    },
})

export const { setFiles } = blueprintSlice.actions
export default blueprintSlice.reducer
