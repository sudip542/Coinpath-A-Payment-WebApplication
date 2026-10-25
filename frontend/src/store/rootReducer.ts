import { combineReducers } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer from "@/features/auth/authSlice";

export const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
});

export default rootReducer;
