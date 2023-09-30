import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config.js";
import LanguageLevelFormInput from "./LanguageLevelFormInput.js";

const LanguageLevelForm = ({ state, dispatch }) => {
  return (
    <div className="language-form">
      {state.languageMode === appConfig.languageModes.KOREAN && (
        <form>
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK1}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK2}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK3}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK4}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK5}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.koreanLanguageLevels.TOPIK6}
            state={state}
            dispatch={dispatch}
          />
        </form>
      )}
      {(state.languageMode === appConfig.languageModes.FRENCH ||
        state.languageMode === appConfig.languageModes.SPANISH) && (
        <form>
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.A1}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.A2}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.B1}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.B2}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.C1}
            state={state}
            dispatch={dispatch}
          />
          <LanguageLevelFormInput
            languageLevelID={appConfig.cferLanguageLevels.C2}
            state={state}
            dispatch={dispatch}
          />
        </form>
      )}
    </div>
  );
};

LanguageLevelForm.propTypes = {
  state: PropTypes.object,
  dispatch: PropTypes.func,
};

export default LanguageLevelForm;
