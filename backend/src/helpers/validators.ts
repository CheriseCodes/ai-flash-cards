import { Request } from 'express';
import { isUndefined } from "./utils";
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