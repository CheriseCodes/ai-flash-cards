import { Request } from 'express';
import { isUndefined } from './utils';
import appConfig from "../config";
import { GenericServerResponse } from '../../types/global';

export const validateGetFlashcardsByUserRequest = (req: Request): GenericServerResponse => {
    if (isUndefined(req.query.userId) || isUndefined(req.query.userId[0])) {
        return {status: 400, body: {message: "User ID is undefined"}}
    }
}

export const validateDeleteFlashcardRequest = (req: Request): GenericServerResponse => {
    // check for undefined values
    if (isUndefined(req.body.userId)) {
        return {status: 400, body: {message: "User ID is undefined"}}
    }
    if (isUndefined(req.body.cardId)) {
        return {status: 400, body: {message: "Flash card ID is undefined"}}
    }
}

export const validateGetImage = (req: Request): GenericServerResponse => {
    // check for undefined values
    if (isUndefined(req.query.word)) {
    return {status: 400, body: {error: "Word to generate is undefined"}}
    }
    if (isUndefined(req.query.lang_mode)) {
    return {status: 400, body: {error: "Language mode is undefined"}}
    }
    if (isUndefined(req.query.sentence)) {
    return {status: 400, body: {error: "Sentence to visualize is undefined"}}
    }
    if (isUndefined(req.query.cardId) || isUndefined(req.query.cardId[0])) {
    return {status: 400, body: {error: "Flash card ID is undefined"}}
    }
    // check if language or words are allowed
    const word = req.query.word;
    const langMode = req.query.lang_mode;
    if (langMode === "Korean") {
    if (!(appConfig.allowedKoreanWords.includes(word.toString()))) {
        return {status: 400, body: {status: 400, message: `Unsupported word: ${word}`}}
    }
    } else if (langMode === "French") {
    if (!(appConfig.allowedFrenchWords.includes(word.toString()))) {
        return {status: 400, body: {status: 400, message: `Unsupported word: ${word}`}}
    }
    } else if (langMode === "Spanish") {
    if (!(appConfig.allowedSpanishWords.includes(word.toString()))) {
        return {status: 400, body: {status: 400, message: `Unsupported word: ${word}`}}
    }
    } else {
    return {status: 400, body: {status: 400, message: `Unsupported language: ${langMode}`}}
    }
}

export const validatePostImage = (req: Request): GenericServerResponse => {
          // check for undefined values
          if (isUndefined(req.body.userId)) {
            return {status: 400, body: {error: `User ID is undefined`}}
          }
          if (isUndefined(req.body.imgUrl)) {
            return {status: 400, body: {error: `URL of image to upload is undefined`}}
          }
          if (isUndefined(req.body.imgName)) {
            return {status: 400, body: {error: `Name of image to upload is undefined`}}
          }
          if (isUndefined(req.body.cardId)) {
            return {status: 400, body: {error: `Flash card ID is undefined`}}
          }
}

export const validateWord = (word, langMode) => {
    if (langMode == appConfig.languageModes.FRENCH) {
      return appConfig.allowedFrenchWords.includes(word);
    } else if (langMode == appConfig.languageModes.SPANISH) {
      return appConfig.allowedSpanishWords.includes(word);
    } else if (langMode == appConfig.languageModes.KOREAN) {
      return appConfig.allowedKoreanWords.includes(word);
    } else {
      return false;
    }
  };
  
export const validateLang = (langMode) => {
    return ["French", "Spanish", "Korean"].includes(langMode);
  };
  
export const validateLangLevel = (langMode, langLevel) => {
    if (
      langMode == appConfig.languageModes.FRENCH ||
      langMode == appConfig.languageModes.SPANISH
    ) {
      return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(langLevel);
    } else if (langMode == appConfig.languageModes.KOREAN) {
      return [
        "TOPIK1",
        "TOPIK2",
        "TOPIK3",
        "TOPIK4",
        "TOPIK5",
        "TOPIK6",
      ].includes(langLevel);
    } else {
      return false;
    }
  };

export const validateGetSentence = (req: Request): GenericServerResponse => {
    // check for undefined values
    if (isUndefined(req.query.word) || isUndefined(req.query.word[0])) {
    return {status: 400, body: {error: `Word to generate is undefined`}}
    }
    if (isUndefined(req.query.lang_mode)) {
    return {status: 400, body: {error: `Target language is undefined`}}
    }
    if (isUndefined(req.query.userId)) {
    return {status: 400, body: {error: `User ID is undefined`}}
    }
    if (isUndefined(req.query.cardId)) {
    return {status: 400, body: {error: `Flash card ID is undefined`}}
    }
    if (isUndefined(req.query.timeStamp)) {
    return {status: 400, body: {error: `Flash card timestamp is undefined`}}
    }
    const wordsToSearch = Array.isArray(req.query.word)
    ? req.query.word
    : [req.query.word];
    const targetLanguage = req.query.lang_mode;
    const targetLevel = req.query.lang_level;
    if (!validateLang(targetLanguage)) {
        return {status: 400, body: {status: 400, message: `Unsupported language: ${targetLanguage}`}}
      }
      let invalidWords = "";
      for (const word of wordsToSearch) {
        if (!(validateWord(word, targetLanguage))) {
          invalidWords = invalidWords + ` ${word}`;
        }
      }
      if (invalidWords !== "") {
        return {status: 400, body: {status: 400, message: `Invalid words:${invalidWords}`}}
      }
      
      if (!(validateLangLevel(targetLanguage, targetLevel))) {
        return {status: 400, body: {status: 400, message: `Invalid language level: ${targetLevel}`}}
      }
}
