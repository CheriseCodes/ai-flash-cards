/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import { languageConfig } from "../src/config";
import LanguageLevelForm from '../src/components/LanguageLevelForm';
import { it, expect } from '@jest/globals';

it("should be set to korean by default and have levels Topik 1-6", () => {
    const { container } = renderWithProviders(<LanguageLevelForm></LanguageLevelForm>);
    const langLevels: NodeListOf<HTMLInputElement> = container.querySelectorAll("input[type=radio]");
    for (let i = 0; i < langLevels.length; i++) {
        expect(langLevels[i].value).toBe(`TOPIK${i+1}`)
    }
});
it("should set levels to A1-C2 when french is selected", () => {
    const { container } = renderWithProviders(<LanguageLevelForm></LanguageLevelForm>, {preloadedState : {
        cards: [],
        languageMode: languageConfig.languageModes.FRENCH,
        languageLevel: languageConfig.cferLanguageLevels.A1,
        selectedCards: [],
    }});
    const langLevels: NodeListOf<HTMLInputElement> = container.querySelectorAll("input[type=radio]");
    for (let i = 0; i < langLevels.length; i++) {
        if (i < 2) {
            expect(langLevels[i].value).toBe(`A${(i%2)+1}`)
        } else if (i < 4) {
            expect(langLevels[i].value).toBe(`B${(i%2)+1}`)
        } else {
            expect(langLevels[i].value).toBe(`C${(i%2)+1}`)
        }
    }
});
it("should set levels to A1-C2 when spanish is selected", () => {
    const { container } = renderWithProviders(<LanguageLevelForm></LanguageLevelForm>, {preloadedState : {
        cards: [],
        languageMode: languageConfig.languageModes.SPANISH,
        languageLevel: languageConfig.cferLanguageLevels.A1,
        selectedCards: [],
    }});
    const langLevels: NodeListOf<HTMLInputElement> = container.querySelectorAll("input[type=radio]");
    for (let i = 0; i < langLevels.length; i++) {
        if (i < 2) {
            expect(langLevels[i].value).toBe(`A${(i%2)+1}`)
        } else if (i < 4) {
            expect(langLevels[i].value).toBe(`B${(i%2)+1}`)
        } else {
            expect(langLevels[i].value).toBe(`C${(i%2)+1}`)
        }
    }
});