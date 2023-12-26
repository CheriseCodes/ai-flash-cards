/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils.js';
import App from "../src/App.js";
import ErrorBanner from '../src/components/ErrorBanner.js';

it("should have the correct values for a valid error", () => {
    const eMsg = "This is a new error";
    const { container } = renderWithProviders(<ErrorBanner e={Error(eMsg)} setErrors={App.setErrors}></ErrorBanner>);
    const eMsgRes = container.querySelector(".alert-heading + p");
    expect(eMsgRes.innerHTML).toBe(eMsg);
});