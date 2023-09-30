import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config.js";

const LanguageModeFormInput = ({
  setLanguageMode,
  languageMode,
  setLanguageLevel,
  languageModeID,
}) => {
  const handleChange = (e) => {
    console.log(e);
    console.log(`LanguageModeFormInput.handleChange - ${languageMode}`);
    if (languageMode !== e.target.value) {
      console.log(`setting language mode to: ${e.target.value}`);
      setLanguageMode(e.target.value);
      if (e.target.value === appConfig.languageModes.KOREAN) {
        setLanguageLevel(appConfig.koreanLanguageLevels.TOPIK1);
      } else {
        setLanguageLevel(appConfig.cferLanguageLevels.A1);
      }
    }
    console.log(`LanguageModeFormInput.handleChange - ${languageMode}`);
  };
  return (
    <div className="language-mode-form-input">
      <input
        type="radio"
        id={`${languageModeID.toLowerCase()}-mode`}
        name="language_mode"
        value={languageModeID}
        checked={languageMode === languageModeID}
        onChange={handleChange}
      ></input>
      <label htmlFor={`${languageModeID.toLowerCase()}-mode`}>
        {languageModeID}
      </label>
    </div>
  );
};

LanguageModeFormInput.propTypes = {
  setLanguageMode: PropTypes.func,
  languageMode: PropTypes.string,
  setLanguageLevel: PropTypes.func,
  languageModeID: PropTypes.string,
};

export default LanguageModeFormInput;
