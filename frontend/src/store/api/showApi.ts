import { baseApi } from "./baseApi";
import type { Show, ShowSeat, Theatre } from "@/types";
import { MOCK_THEATRES, generateMockShows, generateMockSeats } from "@/utils/mockData";

export const showApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShowsByMovieAndDate: builder.query<Show[], { movieId: string; date: string; city?: string }>({
      query: ({ movieId, date, city }) => ({
        apiUrl: "/api/v1/shows",
        config: {
          method: "GET",
          params: { movieId, date, city },
        },
      }),
      providesTags: ["Shows"],
      transformResponse: (response: any, _meta, { movieId, date }) => {
        let list: any[] = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (response && Array.isArray(response.content)) {
          list = response.content;
        } else if (response && Array.isArray(response.data)) {
          list = response.data;
        }

        if (!list || list.length === 0) {
          return generateMockShows(movieId, date);
        }
        return list;
      },
    }),
    getShowDetails: builder.query<Show, string>({
      query: (showId) => ({
        apiUrl: `/api/v1/shows/${showId}`,
        config: {
          method: "GET",
        },
      }),
      providesTags: (_res, _err, showId) => [{ type: "Shows", id: showId }],
      transformResponse: (response: any, _meta, showId) => {
        if (!response || !response.id) {
          const shows = generateMockShows("mov-1", "2026-09-06");
          return shows.find((s) => s.id === showId) || shows[0];
        }
        return response;
      },
    }),
    getShowSeats: builder.query<ShowSeat[], string>({
      query: (showId) => ({
        apiUrl: `/api/v1/shows/${showId}/seats`,
        config: {
          method: "GET",
        },
      }),
      providesTags: (_res, _err, showId) => [{ type: "Shows", id: `${showId}-seats` }],
      transformResponse: (response: any, _meta, showId) => {
        const seats = Array.isArray(response)
          ? response
          : (response && Array.isArray(response.seats) ? response.seats : null);
        if (!seats || seats.length === 0) {
          return generateMockSeats(showId);
        }
        return seats;
      },
    }),
    getTheatres: builder.query<Theatre[], string | void>({
      query: (city) => ({
        apiUrl: "/api/v1/theatres",
        config: {
          method: "GET",
          params: city ? { city } : {},
        },
      }),
      providesTags: ["Theatres"],
      transformResponse: (response: any) => {
        let list: any[] = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (response && Array.isArray(response.content)) {
          list = response.content;
        } else if (response && Array.isArray(response.data)) {
          list = response.data;
        }

        if (!list || list.length === 0) {
          return MOCK_THEATRES;
        }
        return list;
      },
    }),
    createShow: builder.mutation<Show, Partial<Show>>({
      query: (showData) => ({
        apiUrl: "/api/v1/shows",
        config: {
          method: "POST",
          data: showData,
        },
      }),
      invalidatesTags: ["Shows"],
    }),
  }),
});

export const {
  useGetShowsByMovieAndDateQuery,
  useGetShowDetailsQuery,
  useGetShowSeatsQuery,
  useGetTheatresQuery,
  useCreateShowMutation,
} = showApi;
