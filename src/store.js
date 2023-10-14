import reducer from "./reducer.js";
import appConfig from "./config.js";
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/es/storage/index.js";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

console.log(storage);

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

const preloadedState = {
  cards: [],
  languageMode: appConfig.languageModes.KOREAN,
  languageLevel: appConfig.koreanLanguageLevels.TOPIK1,
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  preloadedState,
});

export default store;
