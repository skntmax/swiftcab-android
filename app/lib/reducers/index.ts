import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import usersApi from "../api/users";
import authSlice from "./auth/authSlice";
import counterSlice from "./counter/counterSlice";

export const rootReducer = combineReducers({
   counter: counterSlice,
   auth: authSlice,
   [baseApi.reducerPath]: baseApi.reducer,
   [usersApi.reducerPath]: usersApi.reducer, 
})