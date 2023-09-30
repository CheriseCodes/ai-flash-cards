import React from "react";
import PropTypes from "prop-types";

const LanguageLevelFormInput = ({
  languageLevel,
  setLanguageLevel,
  languageLevelID,
}) => {
  const handleChange = (e) => {
    console.log(e);
    if (setLanguageLevel !== e.target.value) {
      setLanguageLevel(e.target.value);
    }
    console.log(`LanguageLevelFormInput.handleChange - ${e.target.value}`);
  };
  // TODO: Create component for input element
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
  languageLevel: PropTypes.string,
  setLanguageLevel: PropTypes.func,
  languageLevelID: PropTypes.string,
};

export default LanguageLevelFormInput;
