/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import { languageConfig } from "../src/config";
import LanguageLevelFormInput from '../src/components/LanguageLevelFormInput';
import { it, expect } from '@jest/globals';

it("should parse TOPIK levels correctly", () => {
    const { container } = renderWithProviders(<LanguageLevelFormInput languageLevelID={languageConfig.koreanLanguageLevels.TOPIK1}></LanguageLevelFormInput>, {preloadedState : {
        cards: [],
        languageMode: languageConfig.languageModes.KOREAN,
        languageLevel: languageConfig.koreanLanguageLevels.TOPIK1,
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
    const { container } = renderWithProviders(<LanguageLevelFormInput languageLevelID={languageConfig.cferLanguageLevels.A1}></LanguageLevelFormInput>, {preloadedState : {
        cards: [],
        languageMode: languageConfig.languageModes.FRENCH,
        languageLevel: languageConfig.cferLanguageLevels.A1,
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
