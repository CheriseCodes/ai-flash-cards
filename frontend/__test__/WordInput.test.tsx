/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import  languageConfig  from "../config/languages.json";
import WordInput from '../src/components/WordInput';
import { it, expect } from '@jest/globals';

it("should have language modes in the correct order", () => {
    const userId = "default";
    const { container } = renderWithProviders(<WordInput setErrors={() => {}} userId={userId}></WordInput>, {preloadedState : {
        cards: [],
        languageMode: languageConfig.languageModes.KOREAN,
        languageLevel: languageConfig.koreanLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].innerHTML).toBe(" Generate");
    expect(buttons[1].innerHTML).toBe("Download");
});
