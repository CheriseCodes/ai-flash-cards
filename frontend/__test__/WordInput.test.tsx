/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils.js';
import App from '../src/App.js';
import appConfig from '../src/config.js';
import WordInput from '../src/components/WordInput.js';


it("should have language modes in the correct order", () => {
    const setErrors = App.setErrors;
    const userId = "default";
    const { container } = renderWithProviders(<WordInput setErrors={setErrors} userId={userId}></WordInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.KOREAN,
        languageLevel: appConfig.cferLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].innerHTML).toBe(" Generate");
    expect(buttons[1].innerHTML).toBe("Download");
});
