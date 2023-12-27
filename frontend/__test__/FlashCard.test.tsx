/**
 * @jest-environment jsdom
 */
import React from 'react';
import FlashCard from '../src/components/FlashCard';
import { renderWithProviders } from './test-utils';
import { it, expect } from '@jest/globals';

it("should have the correct values for a valid flashcard", () => {
    const id = "abc123";
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
    const { container } = renderWithProviders(<FlashCard key={id} cardData={cardData} setErrors={() => {}} userId="default"></FlashCard>);
    const sentences: NodeListOf<HTMLTextAreaElement> = container.querySelectorAll("textarea.flash-card-sentence");
    const words: NodeListOf<HTMLInputElement> = container.querySelectorAll("input.flash-card-word");
    const img: HTMLImageElement | null = container.querySelector("img");
    expect(sentences[0].innerHTML).toBe("Bonjour tout le monde!");
    expect(sentences[1].innerHTML).toBe("Hello everyone!");
    expect(words[0].value).toBe("bonjour");
    expect(words[1].value).toBe("hello");
    expect(img).not.toBeNull();
    expect(img!.src).toBe("https://picsum.photos/256");
});
it("should display loading spinner when image is being generated", () => {
    const id = "abc123";
    const cardData: FlashCard = {
                        id: id, 
                        generatingText: false,
                        generatingImage: true,
                        word: "bonjour",
                        wordTranslated: "hello",
                        sampleSentence: "Bonjour tout le monde!",
                        translatedSampleSentence: "Hello everyone!",
                    }
    const { container } = renderWithProviders(<FlashCard key={id} cardData={cardData} setErrors={() => {}} userId="default"></FlashCard>);
    const imgContainer: HTMLDivElement | null = container.querySelector(".image-container");
    expect(imgContainer).not.toBeNull();
    expect(imgContainer!.children.length).toBe(1);
    expect(imgContainer!.children[0].className).toBe("loading-spinner");
});
it("should display loading spinner when text is being generated", () => {
    const id = "abc123";
    const cardData: FlashCard = {
                        id: id, 
                        generatingText: true,
                        generatingImage: false,
                        word: "bonjour",
                    }
    const { container } = renderWithProviders(<FlashCard key={id} cardData={cardData} setErrors={() => {}} userId="default"></FlashCard>);
    const imgContainer: HTMLImageElement | null = container.querySelector(".flash-card");
    expect(imgContainer).not.toBeNull();
    expect(imgContainer!.children.length).toBe(1);
    expect(imgContainer!.children[0].className).toBe("loading-spinner");
});