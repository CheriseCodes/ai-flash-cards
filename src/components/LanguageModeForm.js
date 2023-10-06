import React from "react";
import appConfig from "../config.js";

import LanguageModeFormInput from "./LanguageModeFormInput.js";

const LanguageModeForm = () => {
  return (
    <div className="language-mode-form">
      <form>
        <LanguageModeFormInput
          languageModeID={appConfig.languageModes.KOREAN}
        />
        <LanguageModeFormInput
          languageModeID={appConfig.languageModes.FRENCH}
        />
        <LanguageModeFormInput
          languageModeID={appConfig.languageModes.SPANISH}
        />
      </form>
    </div>
  );
};

export default LanguageModeForm;
