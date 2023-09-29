import React from "react";
import PropTypes from 'prop-types';
const LanguageLevelForm = ({
  languageMode,
  languageLevel,
  setLanguageLevel
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
      {languageMode === 'Korean' && (
        <form>
          <input
            type="radio"
            id="topik1"
            name="language_level"
            value="TOPIK1"
            checked={languageLevel === 'TOPIK1'}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik1">TOPIK 1</label>
          <input
            type="radio"
            id="topik2"
            name="language_level"
            value="TOPIK2"
            checked={languageLevel === 'TOPIK2'}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik2">TOPIK 2</label>
          <input
            type="radio"
            id="topik3"
            name="language_level"
            value="TOPIK3"
            checked={languageLevel === 'TOPIK3'}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik3">TOPIK 3</label>
          <input
            type="radio"
            id="topik4"
            name="language_level"
            value="TOPIK4"
            checked={languageLevel === 'TOPIK4'}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik4">TOPIK 4</label>
          <input
            type="radio"
            id="topik5"
            name="language_level"
            value="TOPIK5"
            checked={languageLevel === 'TOPIK5'}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik5">TOPIK 5</label>
          <input
            type="radio"
            id="topik6"
            name="language_level"
            value="TOPIK6"
            checked={languageLevel === 'TOPIK6'}
            onChange={handleChange}
          ></input>
          <label htmlFor="topik6">TOPIK 6</label>
        </form>
      )}
      {(languageMode === 'French' || languageMode === 'Spanish') && (
        <form>
          <input
            type="radio"
            id="a1"
            name="language_level"
            value="A1"
            checked={languageLevel === 'A1'}
            onChange={handleChange}
          ></input>
          <label htmlFor="a1">A1</label>
          <input
            type="radio"
            id="a2"
            name="language_level"
            value="A2"
            checked={languageLevel === 'A2'}
            onChange={handleChange}
          ></input>
          <label htmlFor="a2">A2</label>
          <input
            type="radio"
            id="b1"
            name="language_level"
            value="B1"
            checked={languageLevel === 'B1'}
            onChange={handleChange}
          ></input>
          <label htmlFor="b1">B1</label>
          <input
            type="radio"
            id="b2"
            name="language_level"
            value="B2"
            checked={languageLevel === 'B2'}
            onChange={handleChange}
          ></input>
          <label htmlFor="b2">B2</label>
          <input
            type="radio"
            id="c1"
            name="language_level"
            value="C1"
            checked={languageLevel === 'C1'}
            onChange={handleChange}
          ></input>
          <label htmlFor="c1">C1</label>
          <input
            type="radio"
            id="c2"
            name="language_level"
            value="C2"
            checked={languageLevel === 'C2'}
            onChange={handleChange}
          ></input>
          <label htmlFor="c2">C2</label>
        </form>
      )}
    </div>
  );
};

LanguageLevelForm.propTypes = {
  languageMode: PropTypes.string,
  languageLevel: PropTypes.string,
  setLanguageLevel: PropTypes.func
};

export default LanguageLevelForm;
