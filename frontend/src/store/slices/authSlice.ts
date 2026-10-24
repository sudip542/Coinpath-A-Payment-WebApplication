import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, Role } from "@/types";
import {
  ACCESS_TOKEN_KEY,
  USER_KEY,
  setStoredTokens,
  clearStoredTokens,
} from "../axios/tokenManagement";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
}

const savedToken = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
const savedUserRaw = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
let initialUser: User | null = null;

if (savedUserRaw) {
  try {
    initialUser = JSON.parse(savedUserRaw);
  } catch (e) {
    console.error("Failed to parse stored user", e);
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: savedToken,
  isAuthenticated: Boolean(savedToken && initialUser),
  role: initialUser?.role || null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.role = user.role;

      setStoredTokens(token, refreshToken);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;

      clearStoredTokens();
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.role = action.payload.role;
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
