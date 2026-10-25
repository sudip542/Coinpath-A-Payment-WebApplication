import { apiClient } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/user";

export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    if (isMockMode()) {
      return mockApi.login(credentials);
    }
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH_LOGIN,
      credentials
    );
    return response.data;
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    if (isMockMode()) {
      return mockApi.register(data);
    }
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH_REGISTER,
      data
    );
    return response.data;
  },
};

export default authApi;
