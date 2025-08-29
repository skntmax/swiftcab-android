import { combineReducers } from "@reduxjs/toolkit";
import counterSlice from "./counter/counterSlice";
import usersApi from "../api/users";

export const rootReducer = combineReducers({
   counter:counterSlice,
   [usersApi.reducerPath]: usersApi.reducer, 
})