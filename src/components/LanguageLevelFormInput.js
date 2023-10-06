import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";

const LanguageLevelFormInput = ({ languageLevelID }) => {
  const languageLevel = useSelector((state) => state.languageLevel);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    console.log(e);
    if (languageLevel !== e.target.value) {
      //   setLanguageLevel(e.target.value);
      dispatch({ type: "update-language-level", payload: e.target.value });
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
      <label htmlFor={languageLevelID.toLowerCase()}>{languageLevelID}</label>
    </div>
  );
};

LanguageLevelFormInput.propTypes = {
  languageLevelID: PropTypes.string,
};

export default LanguageLevelFormInput;
