import React from "react";
import { useSelector } from "react-redux";
import { languageConfig } from "../config";
import LanguageLevelFormInput from "./LanguageLevelFormInput";

const LanguageLevelForm = () => {
  const languageMode = useSelector((state: LanguageState) => state.languageMode);
  return (
    <div className="language-form">
      <h2>Target Level</h2>
      {languageMode === languageConfig.languageModes.KOREAN && (
        <form>
          <div className="language-level-container">
            <LanguageLevelFormInput
              languageLevelID={languageConfig.koreanLanguageLevels.TOPIK1}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.koreanLanguageLevels.TOPIK2}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.koreanLanguageLevels.TOPIK3}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.koreanLanguageLevels.TOPIK4}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.koreanLanguageLevels.TOPIK5}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.koreanLanguageLevels.TOPIK6}
            />
          </div>
        </form>
      )}
      {(languageMode === languageConfig.languageModes.FRENCH ||
        languageMode === languageConfig.languageModes.SPANISH) && (
        <form>
          <div className="language-level-container">
            <LanguageLevelFormInput
              languageLevelID={languageConfig.cferLanguageLevels.A1}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.cferLanguageLevels.A2}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.cferLanguageLevels.B1}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.cferLanguageLevels.B2}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.cferLanguageLevels.C1}
            />
            <LanguageLevelFormInput
              languageLevelID={languageConfig.cferLanguageLevels.C2}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default LanguageLevelForm;
