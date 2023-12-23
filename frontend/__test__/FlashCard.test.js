/**
 * @jest-environment jsdom
 */

import FlashCard from '../src/components/FlashCard.js';
import { renderWithProviders } from './test-utils.js';

it("screen height greater than zero", () => {
    renderWithProviders(<FlashCard cardData={{id:"abcd123"}} userId="default"></FlashCard>);
    expect(screen.height > 0);
});