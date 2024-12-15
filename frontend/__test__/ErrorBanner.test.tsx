/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import ErrorBanner from '../src/components/ErrorBanner';
import { it, expect } from '@jest/globals';

it('should have the correct values for a valid error', () => {
    const eMsg = "This is a new error";
    const { container } = renderWithProviders(<ErrorBanner e={{id:"abc123", message: eMsg}} setErrors={() => {}}></ErrorBanner>);
    const eMsgRes = container.querySelector(".alert-heading + p");
    expect(eMsgRes).not.toBeNull();
    expect(eMsgRes!.innerHTML).toBe(eMsg);
});
