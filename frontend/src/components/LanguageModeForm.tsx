import React from "react";
import languageConfig from '../../config/languages.json';

import LanguageModeFormInput from "./LanguageModeFormInput";

const LanguageModeForm = () => {
  return (
    <div className="language-mode-form">
      <h2>Target Language</h2>
      <form>
        <div className="language-mode-container">
          <LanguageModeFormInput
            languageModeID={languageConfig.languageModes.KOREAN}
          />
          <LanguageModeFormInput
            languageModeID={languageConfig.languageModes.FRENCH}
          />
          <LanguageModeFormInput
            languageModeID={languageConfig.languageModes.SPANISH}
          />
        </div>
      </form>
    </div>
  );
};

export default LanguageModeForm;
