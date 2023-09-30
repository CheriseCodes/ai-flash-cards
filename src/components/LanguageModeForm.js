import React from "react";
import PropTypes from "prop-types";
import appConfig from "../config.js";

import LanguageModeFormInput from "./LanguageModeFormInput.js";

const LanguageModeForm = ({ state, dispatch }) => {
  return (
    <div className="language-mode-form">
      <form>
        <LanguageModeFormInput
          languageModeID={appConfig.languageModes.KOREAN}
          state={state}
          dispatch={dispatch}
        />
        <LanguageModeFormInput
          languageModeID={appConfig.languageModes.FRENCH}
          state={state}
          dispatch={dispatch}
        />
        <LanguageModeFormInput
          languageModeID={appConfig.languageModes.SPANISH}
          state={state}
          dispatch={dispatch}
        />
      </form>
    </div>
  );
};

LanguageModeForm.propTypes = {
  state: PropTypes.object,
  dispatch: PropTypes.func,
};

export default LanguageModeForm;
