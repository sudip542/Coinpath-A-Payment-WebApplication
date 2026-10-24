import { baseApi } from "./baseApi";
import type { AdminStats, Theatre } from "@/types";
import { MOCK_ADMIN_STATS } from "@/utils/mockData";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => ({
        apiUrl: "/api/v1/admin/stats",
        config: {
          method: "GET",
        },
      }),
      providesTags: ["Admin"],
      transformResponse: (response: AdminStats) => {
        if (!response || !response.totalBookings) {
          return MOCK_ADMIN_STATS;
        }
        return response;
      },
    }),
    createTheatre: builder.mutation<Theatre, Partial<Theatre>>({
      query: (data) => ({
        apiUrl: "/api/v1/theatres",
        config: {
          method: "POST",
          data,
        },
      }),
      invalidatesTags: ["Theatres", "Admin"],
    }),
    deleteTheatre: builder.mutation<void, string>({
      query: (id) => ({
        apiUrl: `/api/v1/theatres/${id}`,
        config: {
          method: "DELETE",
        },
      }),
      invalidatesTags: ["Theatres", "Admin"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useCreateTheatreMutation,
  useDeleteTheatreMutation,
} = adminApi;
