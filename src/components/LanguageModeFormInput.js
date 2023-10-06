import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import appConfig from "../config.js";

const LanguageModeFormInput = ({ languageModeID }) => {
  const languageMode = useSelector((state) => state.languageMode);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    console.log(e);
    console.log(`LanguageModeFormInput.handleChange - ${languageMode}`);
    if (languageMode !== e.target.value) {
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
  languageModeID: PropTypes.string,
};

export default LanguageModeFormInput;
