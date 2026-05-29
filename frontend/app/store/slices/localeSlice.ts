import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Locale = "en-EN" | "fr-FR";

interface LocaleState {
  value: Locale;
}

const initialState: LocaleState = {
  value: "fr-FR",
};

const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.value = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;