import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthResponse } from "@/types/user";
import { getStoredToken, setStoredToken } from "@/services/interceptors";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialToken = getStoredToken();
const initialUserJson = typeof window !== "undefined" ? localStorage.getItem("coinpath_user") : null;
let initialUser: User | null = null;
if (initialUserJson) {
  try {
    initialUser = JSON.parse(initialUserJson);
  } catch {
    initialUser = null;
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  status: "idle",
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    setAuthSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.status = "succeeded";
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      setStoredToken(action.payload.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("coinpath_user", JSON.stringify(action.payload.user));
      }
    },
    setAuthFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("coinpath_user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      setStoredToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("coinpath_user");
      }
    },
  },
});

export const { setAuthLoading, setAuthSuccess, setAuthFailure, updateUser, logout } =
  authSlice.actions;

export default authSlice.reducer;
