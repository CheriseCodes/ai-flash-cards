import React from "react";
import PropTypes from 'prop-types';

const LanguageForm = ({ setLanguageMode, languageMode, setLanguageLevel }) => {
    const handleChange = (e) => {
        console.log(e)
        console.log(`LanguageForm.handleChange - ${languageMode}`)
        if (languageMode !== e.target.value) {
            console.log(`setting language mode to: ${e.target.value}`)
            setLanguageMode(e.target.value)
            if (e.target.value === 'Korean') {
                setLanguageLevel('TOPIK1')
            } else {
                setLanguageLevel('A1')
            }
        }
        console.log(`LanguageForm.handleChange - ${languageMode}`)
    }
  return (
    <div className="language-form">
        <form>
            <input type="radio" id="kr" name="language_mode" value="Korean" checked={languageMode === 'Korean'} onChange={handleChange}></input>
            <label htmlFor="kr">Korean</label>
            <input type="radio" id="fr" name="language_mode" value="French" checked={languageMode === 'French'} onChange={handleChange}></input>
            <label htmlFor="fr">French</label>
            <input type="radio" id="es" name="language_mode" value="Spanish" checked={languageMode === 'Spanish'} onChange={handleChange}></input>
            <label htmlFor="es">Spanish</label>
        </form>
    </div>
  );
}

LanguageForm.propTypes = {
  setLanguageMode: PropTypes.func,
  languageMode: PropTypes.string,
  setLanguageLevel: PropTypes.func
}

export default LanguageForm;