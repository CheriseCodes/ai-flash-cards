import React from "react";
import appConfig from "../config.js";

import LanguageModeFormInput from "./LanguageModeFormInput.js";

const LanguageModeForm = () => {
  return (
    <div className="language-mode-form">
      <h2>Target Language</h2>
      <form>
        <div className="language-mode-container">
          <LanguageModeFormInput
            languageModeID={appConfig.languageModes.KOREAN}
          />
          <LanguageModeFormInput
            languageModeID={appConfig.languageModes.FRENCH}
          />
          <LanguageModeFormInput
            languageModeID={appConfig.languageModes.SPANISH}
          />
        </div>
      </form>
    </div>
  );
};

export default LanguageModeForm;
