/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils.js';
import appConfig from "../src/config.js";
import LanguageLevelFormInput from '../src/components/LanguageLevelFormInput.js';

it("should parse TOPIK levels correctly", () => {
    const { container } = renderWithProviders(<LanguageLevelFormInput languageLevelID={appConfig.koreanLanguageLevels.TOPIK1}></LanguageLevelFormInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.KOREAN,
        languageLevel: appConfig.cferLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    const inputEl = container.querySelector("input")
    const labelEl = container.querySelector("label")
    expect(labelEl.innerHTML).toBe("TOPIK 1");
    expect(inputEl.id).toBe("topik1")
    expect(inputEl.value).toBe("TOPIK1")
});
it("should parse CFER levels correctly", () => {
    const { container } = renderWithProviders(<LanguageLevelFormInput languageLevelID={appConfig.cferLanguageLevels.A1}></LanguageLevelFormInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.FRENCH,
        languageLevel: appConfig.cferLanguageLevels.A1,
        selectedCards: [],
    }});
    const inputEl = container.querySelector("input")
    const labelEl = container.querySelector("label")
    expect(labelEl.innerHTML).toBe("A1");
    expect(inputEl.id).toBe("a1")
    expect(inputEl.value).toBe("A1")
});
