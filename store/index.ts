import { configureStore } from '@reduxjs/toolkit'
import calibrationReducer from './slices/calibrationSlice'
import canvasReducer from './slices/canvasSlice'
import shapesReducer from './slices/shapesSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            calibration: calibrationReducer,
            canvas: canvasReducer,
            shapes: shapesReducer,
        },
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
