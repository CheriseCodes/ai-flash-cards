import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";

const LanguageModeFormInput = ({ languageModeID } : { languageModeID: string }) => {
  const languageMode = useSelector((state: LanguageState) => state.languageMode);
  const dispatch = useDispatch();

  const handleChange = (e: any) => {
    console.log(e);
    console.log(`LanguageModeFormInput.handleChange - ${languageMode}`);
    // If language mode changes, update redux
    if (languageMode !== e.target.value) {
      console.log(`setting language mode to: ${e.target.value}`);
      dispatch({ type: "update-language-mode", langMode: e.target.value });
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
