/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import LanguageModeFormInput from '../src/components/LanguageModeFormInput';
import { it, expect } from '@jest/globals';

import { languageConfig } from "../src/config";

it("should have correct listed language", () => {
    const { container } = renderWithProviders(<LanguageModeFormInput languageModeID={languageConfig.languageModes.KOREAN}></LanguageModeFormInput>, {preloadedState : {
        cards: [],
        languageMode: languageConfig.languageModes.KOREAN,
        languageLevel: languageConfig.koreanLanguageLevels.TOPIK1,
        selectedCards: [],
    }});
    const labelEl: HTMLLabelElement | null = container.querySelector("label");
    expect(labelEl).not.toBeNull()
    expect(labelEl!.innerHTML).toBe("Korean")
});
