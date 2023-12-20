import React from "react";
import { useSelector } from "react-redux";
import appConfig from "../config";
import LanguageLevelFormInput from "./LanguageLevelFormInput";

const LanguageLevelForm = () => {
  const languageMode = useSelector((state) => state.languageMode);
  return (
    <div className="language-form">
      <h2>Target Level</h2>
      {languageMode === appConfig.languageModes.KOREAN && (
        <form>
          <div className="language-level-container">
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
          </div>
        </form>
      )}
      {(languageMode === appConfig.languageModes.FRENCH ||
        languageMode === appConfig.languageModes.SPANISH) && (
        <form>
          <div className="language-level-container">
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
          </div>
        </form>
      )}
    </div>
  );
};

export default LanguageLevelForm;
