import appConfig from "../config";

const validateWord = (word, langMode) => {
  if (langMode == appConfig.languageModes.FRENCH) {
    return appConfig.allowedFrenchWords.includes(word);
  } else if (langMode == appConfig.languageModes.SPANISH) {
    return appConfig.allowedSpanishWords.includes(word);
  } else if (langMode == appConfig.languageModes.KOREAN) {
    return appConfig.allowedKoreanWords.includes(word);
  } else {
    return false;
  }
};

const validateLang = (langMode) => {
  return ["French", "Spanish", "Korean"].includes(langMode);
};

const validateLangLevel = (langMode, langLevel) => {
  if (
    langMode == appConfig.languageModes.FRENCH ||
    langMode == appConfig.languageModes.SPANISH
  ) {
    return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(langLevel);
  } else if (langMode == appConfig.languageModes.KOREAN) {
    return [
      "TOPIK1",
      "TOPIK2",
      "TOPIK3",
      "TOPIK4",
      "TOPIK5",
      "TOPIK6",
    ].includes(langLevel);
  } else {
    return false;
  }
};

export { validateWord, validateLang, validateLangLevel };
