import { apiClient } from "@/services/apiClient";
import { API_ROUTES } from "@/services/apiRoutes";
import { mockApi, isMockMode } from "@/services/mockApi";
import type { Page } from "@/types/api";
import type { NotificationItem } from "@/types/transaction";

export const notificationApi = {
  async getNotifications(page: number = 0, size: number = 20): Promise<Page<NotificationItem>> {
    if (isMockMode()) {
      return mockApi.getNotifications(page, size);
    }
    const response = await apiClient.get<Page<NotificationItem>>(
      `${API_ROUTES.NOTIFICATIONS}?page=${page}&size=${size}`
    );
    return response.data;
  },
};

export default notificationApi;
