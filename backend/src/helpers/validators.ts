import { Request } from 'express';
import { isUndefined } from "./utils";
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