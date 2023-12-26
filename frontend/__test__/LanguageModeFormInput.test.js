/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils.js';
import LanguageModeFormInput from '../src/components/LanguageModeFormInput.js';

import appConfig from "../src/config.js";

it("should have correct listed language", () => {
    const { container } = renderWithProviders(<LanguageModeFormInput languageModeID={appConfig.languageModes.KOREAN}></LanguageModeFormInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.KOREAN,
        languageLevel: appConfig.cferLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    console.log(container.outerHTML)
    const labelEl = container.querySelector("label");
    expect(labelEl.innerHTML).toBe("Korean")
});
