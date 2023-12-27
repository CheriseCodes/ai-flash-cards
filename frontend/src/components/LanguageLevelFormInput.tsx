import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config";

import { useSelector, useDispatch } from "react-redux";

const LanguageLevelFormInput = ({ languageLevelID } : { languageLevelID: string }) => {
  const languageLevel = useSelector((state: LanguageState) => state.languageLevel);
  const languageMode = useSelector((state: LanguageState) => state.languageMode);
  const dispatch = useDispatch();

  const handleChange = (e: any) => {
    console.log(e);
    if (languageLevel !== e.target.value) {
      dispatch({ type: "update-language-level", langLevel: e.target.value });
    }
    console.log(`LanguageLevelFormInput.handleChange - ${e.target.value}`);
  };

  return (
    <div className="language-form-input">
      <input
        type="radio"
        id={languageLevelID.toLowerCase()}
        name="language_level"
        value={languageLevelID}
        checked={languageLevel === languageLevelID}
        onChange={handleChange}
      ></input>
      <label htmlFor={languageLevelID.toLowerCase()}>
        {languageMode === appConfig.languageModes.KOREAN
          ? `${languageLevelID.slice(0, -1)} ${languageLevelID.slice(-1)}`
          : languageLevelID}
      </label>
    </div>
  );
};

LanguageLevelFormInput.propTypes = {
  languageLevelID: PropTypes.string,
};

export default LanguageLevelFormInput;
