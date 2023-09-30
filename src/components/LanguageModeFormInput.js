import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config.js";

const LanguageModeFormInput = ({ languageModeID, state, dispatch }) => {
  const handleChange = (e) => {
    console.log(e);
    console.log(`LanguageModeFormInput.handleChange - ${state.languageMode}`);
    if (state.languageMode !== e.target.value) {
      console.log(`setting language mode to: ${e.target.value}`);
      // setLanguageMode(e.target.value);
      dispatch({ type: "update-language-mode", payload: e.target.value });
      if (e.target.value === appConfig.languageModes.KOREAN) {
        // setLanguageLevel(appConfig.koreanLanguageLevels.TOPIK1);
        dispatch({
          type: "update-language-level",
          payload: appConfig.koreanLanguageLevels.TOPIK1,
        });
      } else {
        // setLanguageLevel(appConfig.cferLanguageLevels.A1);
        dispatch({
          type: "update-language-level",
          payload: appConfig.cferLanguageLevels.A1,
        });
      }
    }
    console.log(`LanguageModeFormInput.handleChange - ${state.languageMode}`);
  };
  return (
    <div className="language-mode-form-input">
      <input
        type="radio"
        id={`${languageModeID.toLowerCase()}-mode`}
        name="language_mode"
        value={languageModeID}
        checked={state.languageMode === languageModeID}
        onChange={handleChange}
      ></input>
      <label htmlFor={`${languageModeID.toLowerCase()}-mode`}>
        {languageModeID}
      </label>
    </div>
  );
};

LanguageModeFormInput.propTypes = {
  languageModeID: PropTypes.string,
  state: PropTypes.object,
  dispatch: PropTypes.func,
};

export default LanguageModeFormInput;
