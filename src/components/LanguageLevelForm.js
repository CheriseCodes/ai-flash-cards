import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config.js";
import LanguageLevelFormInput from "./LanguageLevelFormInput.js";

const LanguageLevelForm = ({
  languageMode,
  languageLevel,
  setLanguageLevel,
}) => {
  return (
    <div className="language-form">
      {languageMode === appConfig.languageModes.KOREAN && (
        <form>
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK1}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK2}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK3}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK4}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK5}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK6}
          />
        </form>
      )}
      {(languageMode === appConfig.languageModes.FRENCH ||
        languageMode === appConfig.languageModes.SPANISH) && (
        <form>
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.cferLanguageLevels.A1}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.cferLanguageLevels.A2}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.cferLanguageLevels.B1}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.cferLanguageLevels.B2}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.cferLanguageLevels.C1}
          />
          <LanguageLevelFormInput
            languageLevel={languageLevel}
            setLanguageLevel={setLanguageLevel}
            languageLevelID={appConfig.cferLanguageLevels.C2}
          />
        </form>
      )}
    </div>
  );
};

LanguageLevelForm.propTypes = {
  languageMode: PropTypes.string,
  languageLevel: PropTypes.string,
  setLanguageLevel: PropTypes.func,
};

export default LanguageLevelForm;
