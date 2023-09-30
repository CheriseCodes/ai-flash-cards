import React from "react";
import PropTypes from "prop-types";

const LanguageLevelFormInput = ({ languageLevelID, state, dispatch }) => {
  const handleChange = (e) => {
    console.log(e);
    if (state.languageLevel !== e.target.value) {
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
        checked={state.languageLevel === languageLevelID}
        onChange={handleChange}
      ></input>
      <label htmlFor={languageLevelID.toLowerCase()}>{languageLevelID}</label>
    </div>
  );
};

LanguageLevelFormInput.propTypes = {
  languageLevelID: PropTypes.string,
  state: PropTypes.object,
  dispatch: PropTypes.func,
};

export default LanguageLevelFormInput;
