import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config";

const LanguageLevelForm = ({
  languageMode,
  languageLevel,
  setLanguageLevel,
}) => {
  const handleChange = (e) => {
    console.log(e);
    if (setLanguageLevel !== e.target.value) {
      setLanguageLevel(e.target.value);
    }
    console.log(`LanguageLevelForm.handleChange - ${e.target.value}`);
  };
  return (
    <div className="language-form">
      {languageMode === appConfig.languageModes.KOREAN && (
        <form>
          <input
            type="radio"
            id={appConfig.koreanLanguageLevels.TOPIK1.toLowerCase()}
            name="language_level"
            value={appConfig.koreanLanguageLevels.TOPIK1}
            checked={languageLevel === appConfig.koreanLanguageLevels.TOPIK1}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.koreanLanguageLevels.TOPIK1.toLowerCase()}>{appConfig.koreanLanguageLevels.TOPIK1}</label>
          <input
            type="radio"
            id={appConfig.koreanLanguageLevels.TOPIK2.toLowerCase()}
            name="language_level"
            value={appConfig.koreanLanguageLevels.TOPIK2}
            checked={languageLevel === appConfig.koreanLanguageLevels.TOPIK2}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.koreanLanguageLevels.TOPIK2.toLowerCase()}>{appConfig.koreanLanguageLevels.TOPIK2}</label>
          <input
            type="radio"
            id={appConfig.koreanLanguageLevels.TOPIK3.toLowerCase()}
            name="language_level"
            value={appConfig.koreanLanguageLevels.TOPIK3}
            checked={languageLevel === appConfig.koreanLanguageLevels.TOPIK3}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.koreanLanguageLevels.TOPIK1.toLowerCase()}>{appConfig.koreanLanguageLevels.TOPIK3}</label>
          <input
            type="radio"
            id={appConfig.koreanLanguageLevels.TOPIK4.toLowerCase()}
            name="language_level"
            value={appConfig.koreanLanguageLevels.TOPIK4}
            checked={languageLevel === appConfig.koreanLanguageLevels.TOPIK4}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik4">{appConfig.koreanLanguageLevels.TOPIK4}</label>
          <input
            type="radio"
            id={appConfig.koreanLanguageLevels.TOPIK5.toLowerCase()}
            name="language_level"
            value={appConfig.koreanLanguageLevels.TOPIK5}
            checked={languageLevel === appConfig.koreanLanguageLevels.TOPIK5}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik5">{appConfig.koreanLanguageLevels.TOPIK5}</label>
          <input
            type="radio"
            id={appConfig.koreanLanguageLevels.TOPIK6.toLowerCase()}
            name="language_level"
            value={appConfig.koreanLanguageLevels.TOPIK6}
            checked={languageLevel === appConfig.koreanLanguageLevels.TOPIK6}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.koreanLanguageLevels.TOPIK6.toLowerCase()}>{appConfig.koreanLanguageLevels.TOPIK6}</label>
        </form>
      )}
      {(languageMode === appConfig.languageModes.FRENCH || languageMode === appConfig.languageModes.SPANISH) && (
        <form>
          <input
            type="radio"
            id={appConfig.cferLanguageLevels.A1.toLowerCase()}
            name="language_level"
            value={appConfig.cferLanguageLevels.A1}
            checked={languageLevel === appConfig.cferLanguageLevels.A1}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.cferLanguageLevels.A1.toLowerCase()}>{appConfig.cferLanguageLevels.A1}</label>
          <input
            type="radio"
            id={appConfig.cferLanguageLevels.A2.toLowerCase()}
            name="language_level"
            value={appConfig.cferLanguageLevels.A2}
            checked={languageLevel === appConfig.cferLanguageLevels.A2}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.cferLanguageLevels.A2.toLowerCase()}>{appConfig.cferLanguageLevels.A2}</label>
          <input
            type="radio"
            id={appConfig.cferLanguageLevels.B1.toLowerCase()}
            name="language_level"
            value={appConfig.cferLanguageLevels.B1}
            checked={languageLevel === appConfig.cferLanguageLevels.B1}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.cferLanguageLevels.B1.toLowerCase()}>{appConfig.cferLanguageLevels.B1}</label>
          <input
            type="radio"
            id={appConfig.cferLanguageLevels.B2.toLowerCase()}
            name="language_level"
            value={appConfig.cferLanguageLevels.B2}
            checked={languageLevel === appConfig.cferLanguageLevels.B2}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.cferLanguageLevels.B2.toLowerCase()}>{appConfig.cferLanguageLevels.B2}</label>
          <input
            type="radio"
            id={appConfig.cferLanguageLevels.C1.toLowerCase()}
            name="language_level"
            value={appConfig.cferLanguageLevels.C1}
            checked={languageLevel === appConfig.cferLanguageLevels.C1}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.cferLanguageLevels.C1.toLowerCase()}>{appConfig.cferLanguageLevels.C1}</label>
          <input
            type="radio"
            id={appConfig.cferLanguageLevels.C2.toLowerCase()}
            name="language_level"
            value={appConfig.cferLanguageLevels.C2}
            checked={languageLevel === appConfig.cferLanguageLevels.C2}
            onChange={handleChange}
          ></input>
          <label htmlFor={appConfig.cferLanguageLevels.C2.toLowerCase()}>{appConfig.cferLanguageLevels.C2}</label>
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
