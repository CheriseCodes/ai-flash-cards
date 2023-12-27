/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import appConfig from "../src/config";
import LanguageLevelFormInput from '../src/components/LanguageLevelFormInput';
import { it, expect } from '@jest/globals';

it("should parse TOPIK levels correctly", () => {
    const { container } = renderWithProviders(<LanguageLevelFormInput languageLevelID={appConfig.koreanLanguageLevels.TOPIK1}></LanguageLevelFormInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.KOREAN,
        languageLevel: appConfig.koreanLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    const inputEl: HTMLInputElement | null = container.querySelector("input")
    const labelEl: HTMLLabelElement | null = container.querySelector("label")
    expect(labelEl).not.toBeNull()
    expect(inputEl).not.toBeNull()
    expect(labelEl!.innerHTML).toBe("TOPIK 1");
    expect(inputEl!.id).toBe("topik1")
    expect(inputEl!.value).toBe("TOPIK1")
});
it("should parse CFER levels correctly", () => {
    const { container } = renderWithProviders(<LanguageLevelFormInput languageLevelID={appConfig.cferLanguageLevels.A1}></LanguageLevelFormInput>, {preloadedState : {
        cards: [],
        languageMode: appConfig.languageModes.FRENCH,
        languageLevel: appConfig.cferLanguageLevels.A1,
        selectedCards: [],
    }});
    const inputEl: HTMLInputElement | null = container.querySelector("input")
    const labelEl: HTMLLabelElement | null = container.querySelector("label")
    expect(labelEl).not.toBeNull()
    expect(inputEl).not.toBeNull()
    expect(labelEl!.innerHTML).toBe("A1");
    expect(inputEl!.id).toBe("a1")
    expect(inputEl!.value).toBe("A1")
});
