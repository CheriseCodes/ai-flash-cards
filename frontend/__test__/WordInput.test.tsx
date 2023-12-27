/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import appConfig from '../src/config';
import WordInput from '../src/components/WordInput';
import { it, expect } from '@jest/globals';

it("should have language modes in the correct order", () => {
    const userId = "default";
    const { container } = renderWithProviders(<WordInput setErrors={() => {}} userId={userId}></WordInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.KOREAN,
        languageLevel: appConfig.koreanLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].innerHTML).toBe(" Generate");
    expect(buttons[1].innerHTML).toBe("Download");
});
