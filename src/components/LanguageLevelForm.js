import React from "react";
import { useSelector } from "react-redux";
import appConfig from "../config.js";
import LanguageLevelFormInput from "./LanguageLevelFormInput.js";

const LanguageLevelForm = () => {
  const languageMode = useSelector((state) => state.languageMode);
  return (
    <div className="language-form">
      {languageMode === appConfig.languageModes.KOREAN && (
        <form>
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK1}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK2}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK3}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK4}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK5}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK6}
          />
        </form>
      )}
      {(languageMode === appConfig.languageModes.FRENCH ||
        languageMode === appConfig.languageModes.SPANISH) && (
        <form>
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.A1}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.A2}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.B1}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.B2}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.C1}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.C2}
          />
        </form>
      )}
    </div>
  );
};

export default LanguageLevelForm;
