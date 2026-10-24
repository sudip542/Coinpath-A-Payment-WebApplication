import { baseApi } from "./baseApi";
import type { AuthResponse, LoginRequest, RegisterRequest, User, Role } from "@/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      AuthResponse,
      LoginRequest | { usernameOrEmail: string; password: string }
    >({
      query: (credentials) => ({
        apiUrl: "/api/v1/auth/login",
        config: {
          method: "POST",
          data: {
            usernameOrEmail:
              "usernameOrEmail" in credentials
                ? credentials.usernameOrEmail
                : credentials.email,
            password: credentials.password,
          },
        },
      }),
      invalidatesTags: ["Auth"],
      transformResponse: (response: any) => {
        if (response?.accessToken) {
          const primaryRole = (response.roles?.[0]?.replace("ROLE_", "") || "USER") as Role;
          return {
            token: response.accessToken,
            refreshToken: response.refreshToken,
            user: {
              id: String(response.userId || response.id || ""),
              name: response.username || response.fullName || response.email?.split("@")[0] || "User",
              email: response.email,
              role: primaryRole,
              phoneNumber: response.phoneNumber,
            },
          };
        }
        return response;
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest | Record<string, any>>({
      query: (userData: any) => ({
        apiUrl: "/api/v1/auth/register",
        config: {
          method: "POST",
          data: {
            username:
              userData.username ||
              userData.email?.split("@")[0] ||
              (userData.name ? userData.name.toLowerCase().replace(/\s+/g, "") : "user"),
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName || userData.name || "ShowZen User",
            phoneNumber: userData.phoneNumber || "0000000000",
            roles: userData.roles || (userData.role ? [`ROLE_${userData.role}`] : ["ROLE_USER"]),
          },
        },
      }),
      invalidatesTags: ["Auth"],
      transformResponse: (response: any) => {
        if (response?.accessToken) {
          const primaryRole = (response.roles?.[0]?.replace("ROLE_", "") || "USER") as Role;
          return {
            token: response.accessToken,
            refreshToken: response.refreshToken,
            user: {
              id: String(response.userId || response.id || ""),
              name: response.username || response.fullName || response.email?.split("@")[0] || "User",
              email: response.email,
              role: primaryRole,
              phoneNumber: response.phoneNumber,
            },
          };
        }
        return response;
      },
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        apiUrl: "/api/v1/users/me",
        config: {
          method: "GET",
        },
      }),
      providesTags: ["Auth"],
      transformResponse: (response: any) => {
        if (response && (response.id || response.userId)) {
          const primaryRole = (response.roles?.[0]?.replace("ROLE_", "") || response.role || "USER") as Role;
          return {
            id: String(response.userId || response.id),
            name: response.fullName || response.username || response.name || "User",
            email: response.email,
            role: primaryRole,
            phoneNumber: response.phoneNumber,
          };
        }
        return response;
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi;
