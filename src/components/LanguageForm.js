import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config";

const LanguageForm = ({ setLanguageMode, languageMode, setLanguageLevel }) => {
  const handleChange = (e) => {
    console.log(e);
    console.log(`LanguageForm.handleChange - ${languageMode}`);
    if (languageMode !== e.target.value) {
      console.log(`setting language mode to: ${e.target.value}`);
      setLanguageMode(e.target.value);
      if (e.target.value === appConfig.languageModes.KOREAN) {
        setLanguageLevel(appConfig.koreanLanguageLevels.TOPIK1);
      } else {
        setLanguageLevel(appConfig.cferLanguageLevels.A1);
      }
    }
    console.log(`LanguageForm.handleChange - ${languageMode}`);
  };
  return (
    <div className="language-form">
      <form>
        <input
          type="radio"
          id="kr"
          name="language_mode"
          value={appConfig.languageModes.KOREAN}
          checked={languageMode === appConfig.languageModes.KOREAN}
          onChange={handleChange}
        ></input>
        <label htmlFor="kr">{appConfig.languageModes.KOREAN}</label>
        <input
          type="radio"
          id="fr"
          name="language_mode"
          value={appConfig.languageModes.FRENCH}
          checked={languageMode === appConfig.languageModes.FRENCH}
          onChange={handleChange}
        ></input>
        <label htmlFor="fr">{appConfig.languageModes.FRENCH}</label>
        <input
          type="radio"
          id="es"
          name="language_mode"
          value={appConfig.languageModes.SPANISH}
          checked={languageMode === appConfig.languageModes.SPANISH}
          onChange={handleChange}
        ></input>
        <label htmlFor="es">{appConfig.languageModes.SPANISH}</label>
      </form>
    </div>
  );
};

LanguageForm.propTypes = {
  setLanguageMode: PropTypes.func,
  languageMode: PropTypes.string,
  setLanguageLevel: PropTypes.func,
};

export default LanguageForm;
