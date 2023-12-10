/**
 * @jest-environment jsdom
 */

import FlashCard from '../src/components/FlashCard.js';
import { renderWithProviders } from './test-utils.js';

// TODO: start using https://mswjs.io/docs/getting-started

it("screen height greater than zero", () => {
    renderWithProviders(<FlashCard cardData={{id:"abcd123"}} userId="default"></FlashCard>);
    expect(screen.height > 0);
});