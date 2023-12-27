interface FlashCard {
    id: string;
    word?: string;
    wordTranslated?: string;
    generatingImage?: boolean;
    generatingText?: boolean;
    sampleSentence?: string;
    translatedSampleSentence?: string;
    img?: string;
}

interface ErrorMessage {
    id: string;
    message: string;
}

interface LanguageState {
    languageMode: string;
    languageLevel: string;
}

interface CardState {
    cards: string[];
    selectedCards: string[];
}

declare module 'uuid'