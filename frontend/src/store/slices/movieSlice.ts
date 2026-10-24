import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Genre, Language } from "@/types";

interface MovieState {
  searchQuery: string;
  selectedGenre: Genre | "ALL";
  selectedLanguage: Language | "ALL";
  selectedCity: string;
}

const initialState: MovieState = {
  searchQuery: "",
  selectedGenre: "ALL",
  selectedLanguage: "ALL",
  selectedCity: "Mumbai",
};

export const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedGenre: (state, action: PayloadAction<Genre | "ALL">) => {
      state.selectedGenre = action.payload;
    },
    setSelectedLanguage: (state, action: PayloadAction<Language | "ALL">) => {
      state.selectedLanguage = action.payload;
    },
    setSelectedCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
    },
    resetMovieFilters: (state) => {
      state.searchQuery = "";
      state.selectedGenre = "ALL";
      state.selectedLanguage = "ALL";
    },
  },
});

export const {
  setSearchQuery,
  setSelectedGenre,
  setSelectedLanguage,
  setSelectedCity,
  resetMovieFilters,
} = movieSlice.actions;

export default movieSlice.reducer;
