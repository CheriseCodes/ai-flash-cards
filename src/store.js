import reducer from "./reducer.js";
import appConfig from "./config.js";
import { configureStore } from "@reduxjs/toolkit";

const preloadedState = {
  cards: [],
  languageMode: appConfig.languageModes.KOREAN,
  languageLevel: appConfig.koreanLanguageLevels.TOPIK1,
};
const store = configureStore({ reducer: reducer, preloadedState });

export default store;
