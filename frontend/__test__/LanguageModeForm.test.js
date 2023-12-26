/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils.js';
import LanguageModeForm from '../src/components/LanguageModeForm.js';

it("should have language modes in the correct order", () => {
    const { container } = renderWithProviders(<LanguageModeForm></LanguageModeForm>);
    const langModes = container.querySelectorAll("input[type=radio]");
    expect(langModes[0].value).toBe("Korean")
    expect(langModes[1].value).toBe("French")
    expect(langModes[2].value).toBe("Spanish")
});
