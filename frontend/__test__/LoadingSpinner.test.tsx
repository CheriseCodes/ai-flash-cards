/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderWithProviders } from './test-utils';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { it, expect } from '@jest/globals';
it("spinner should be visible when rendered", () => {
    const { container } = renderWithProviders(<LoadingSpinner ></LoadingSpinner>);
    const el = container.querySelector("div");
    expect(el).toBeTruthy()
});