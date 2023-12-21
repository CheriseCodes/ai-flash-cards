/**
 * @jest-environment jsdom
 */
import React from 'react';
import FlashCard from '../src/components/FlashCard.js';
import { renderWithProviders } from './test-utils.js';
// import { screen } from '@testing-library/react';

it("should have the correct values for a valid flashcard", () => {
    const id = "abc123";
    const setErrors = (x) => {return [x]; };
    const cardData = {
                        id: id, 
                        generatingText: false,
                        generatingImage: false,
                        word: "bonjour",
                        wordTranslated: "hello",
                        sampleSentence: "Bonjour tout le monde!",
                        translatedSampleSentence: "Hello everyone!",
                        img: "https://picsum.photos/256"
                    }
    const { container } = renderWithProviders(<FlashCard key={id} cardData={cardData} setErrors={setErrors} userId="default"></FlashCard>);
    const sentences = container.querySelectorAll("textarea.flash-card-sentence");
    const words = container.querySelectorAll("input.flash-card-word");
    expect(sentences[0].innerHTML).toBe("Bonjour tout le monde!");
    expect(sentences[1].innerHTML).toBe("Hello everyone!");
    expect(words[0].value).toBe("bonjour");
    expect(words[1].value).toBe("hello");
});