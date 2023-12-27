/**
 * @jest-environment jsdom
 */
import React from 'react';
import FlashCard from '../src/components/FlashCard.js';
import { renderWithProviders } from './test-utils.js';
import App from "../src/App.js";

it("should have the correct values for a valid flashcard", () => {
    const id = "abc123";
    const setErrors = App.setErrors;
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
    const img = container.querySelector("img");
    expect(sentences[0].innerHTML).toBe("Bonjour tout le monde!");
    expect(sentences[1].innerHTML).toBe("Hello everyone!");
    expect(words[0].value).toBe("bonjour");
    expect(words[1].value).toBe("hello");
    expect(img.src).toBe("https://picsum.photos/256");
});
it("should display loading spinner when image is being generated", () => {
    const id = "abc123";
    const setErrors = App.setErrors;
    const cardData = {
                        id: id, 
                        generatingText: false,
                        generatingImage: true,
                        word: "bonjour",
                        wordTranslated: "hello",
                        sampleSentence: "Bonjour tout le monde!",
                        translatedSampleSentence: "Hello everyone!",
                        img: null
                    }
    const { container } = renderWithProviders(<FlashCard key={id} cardData={cardData} setErrors={setErrors} userId="default"></FlashCard>);
    const imgContainer = container.querySelector(".image-container");
    expect(imgContainer.children.length).toBe(1);
    expect(imgContainer.children[0].className).toBe("loading-spinner");
});
it("should display loading spinner when text is being generated", () => {
    const id = "abc123";
    const setErrors = App.setErrors;
    const cardData = {
                        id: id, 
                        generatingText: true,
                        generatingImage: false,
                        word: "bonjour",
                        wordTranslated: null,
                        sampleSentence: null,
                        translatedSampleSentence: null,
                        img: null
                    }
    const { container } = renderWithProviders(<FlashCard key={id} cardData={cardData} setErrors={setErrors} userId="default"></FlashCard>);
    const imgContainer = container.querySelector(".flash-card");
    expect(imgContainer.children.length).toBe(1);
    expect(imgContainer.children[0].className).toBe("loading-spinner");
});