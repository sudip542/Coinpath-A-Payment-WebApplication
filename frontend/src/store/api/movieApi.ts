import { baseApi } from "./baseApi";
import type { Movie } from "@/types";
import { MOCK_MOVIES } from "@/utils/mockData";

export function normalizeMovie(m: any): Movie {
  const genres = Array.isArray(m.genre)
    ? m.genre
    : typeof m.genre === "string"
    ? m.genre.split(",").map((s: string) => s.trim()).filter(Boolean)
    : ["ACTION"];

  const languages = Array.isArray(m.language)
    ? m.language
    : typeof m.language === "string"
    ? m.language.split(",").map((s: string) => s.trim()).filter(Boolean)
    : ["ENGLISH"];

  return {
    id: String(m.id ?? ""),
    title: m.title ?? "Untitled",
    description: m.description ?? "",
    posterUrl:
      m.posterUrl ||
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    bannerUrl:
      m.bannerUrl ||
      m.posterUrl ||
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: m.trailerUrl || "",
    genre: genres.length > 0 ? genres : ["ACTION"],
    language: languages.length > 0 ? languages : ["ENGLISH"],
    durationMinutes: Number(m.durationMinutes ?? 120),
    rating: Number(m.rating ?? 8.0),
    releaseDate: m.releaseDate ? String(m.releaseDate) : new Date().toISOString().split("T")[0],
    cast: Array.isArray(m.cast) ? m.cast : [],
    isTrending: m.isTrending ?? true,
  };
}

export const movieApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMovies: builder.query<Movie[], { genre?: string; language?: string; search?: string } | void>({
      query: (params) => ({
        apiUrl: "/api/v1/movies",
        config: {
          method: "GET",
          params: params || {},
        },
      }),
      providesTags: ["Movies"],
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
          return MOCK_MOVIES;
        }
        return list.map(normalizeMovie);
      },
    }),
    getMovieById: builder.query<Movie, string>({
      query: (id) => ({
        apiUrl: `/api/v1/movies/${id}`,
        config: {
          method: "GET",
        },
      }),
      providesTags: (_res, _err, id) => [{ type: "Movies", id }],
      transformResponse: (response: any, _meta, id) => {
        if (!response || !response.id) {
          return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
        }
        return normalizeMovie(response);
      },
    }),
    createMovie: builder.mutation<Movie, Partial<Movie>>({
      query: (data) => ({
        apiUrl: "/api/v1/movies",
        config: {
          method: "POST",
          data,
        },
      }),
      invalidatesTags: ["Movies"],
    }),
    updateMovie: builder.mutation<Movie, { id: string; data: Partial<Movie> }>({
      query: ({ id, data }) => ({
        apiUrl: `/api/v1/movies/${id}`,
        config: {
          method: "PUT",
          data,
        },
      }),
      invalidatesTags: ["Movies"],
    }),
    deleteMovie: builder.mutation<void, string>({
      query: (id) => ({
        apiUrl: `/api/v1/movies/${id}`,
        config: {
          method: "DELETE",
        },
      }),
      invalidatesTags: ["Movies"],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetMovieByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = movieApi;
