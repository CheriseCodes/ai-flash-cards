import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config.js";

import LanguageModeFormInput from "./LanguageModeFormInput.js";

const LanguageModeForm = ({
  setLanguageMode,
  languageMode,
  setLanguageLevel,
}) => {
  return (
    <div className="language-mode-form">
      <form>
        <LanguageModeFormInput
          setLanguageMode={setLanguageMode}
          languageMode={languageMode}
          setLanguageLevel={setLanguageLevel}
          languageModeID={appConfig.languageModes.KOREAN}
        />
        <LanguageModeFormInput
          setLanguageMode={setLanguageMode}
          languageMode={languageMode}
          setLanguageLevel={setLanguageLevel}
          languageModeID={appConfig.languageModes.FRENCH}
        />
        <LanguageModeFormInput
          setLanguageMode={setLanguageMode}
          languageMode={languageMode}
          setLanguageLevel={setLanguageLevel}
          languageModeID={appConfig.languageModes.SPANISH}
        />
      </form>
    </div>
  );
};

LanguageModeForm.propTypes = {
  setLanguageMode: PropTypes.func,
  languageMode: PropTypes.string,
  setLanguageLevel: PropTypes.func,
};

export default LanguageModeForm;
