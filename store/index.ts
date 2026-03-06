import { configureStore } from '@reduxjs/toolkit'
import calibrationReducer from './features/calibration/calibrationSlice'
import canvasReducer from './features/canvas/canvasSlice'
import shapesReducer from './features/shapes/shapesSlice'
import blueprintReducer from './features/blueprint/blueprintSlice'
import { blueprintsApi } from './features/blueprint/blueprintsApi'

export const makeStore = () => {
    return configureStore({
        reducer: {
            calibration: calibrationReducer,
            canvas: canvasReducer,
            shapes: shapesReducer,
            blueprint: blueprintReducer,
            [blueprintsApi.reducerPath]: blueprintsApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(blueprintsApi.middleware),
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
