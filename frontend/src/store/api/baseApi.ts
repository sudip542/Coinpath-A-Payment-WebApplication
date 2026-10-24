import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axios/axiosBaseQuery";
import { BASE_API_URL } from "@/utils/config/url";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: BASE_API_URL,
  }),
  tagTypes: [
    "Movies",
    "Shows",
    "Theatres",
    "Bookings",
    "Auth",
    "Admin",
  ],
  endpoints: () => ({}),
});
