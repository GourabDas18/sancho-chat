import {configureStore} from "@reduxjs/toolkit";
import storeSlice from "./storeSlice";
const store = configureStore({
    reducer: storeSlice
})
export default store;