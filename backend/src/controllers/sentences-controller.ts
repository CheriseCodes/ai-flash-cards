import { Request, Response } from 'express';
import { openai } from "../clients/openai";
import { dynamoDbClient } from "../clients/aws";
import { GenericServerResponse } from '../../types/global';
import { handleGetSentence } from '../handlers/sentences-handlers';

 export const getSentence = async (req: Request, res: Response) => {
      const wordsToSearch = Array.isArray(req.query.word)
        ? req.query.word.toString()
        : [req.query.word.toString()];
      const targetLanguage = req.query.lang_mode.toString();
      const targetLevel = req.query.lang_level.toString();
      const userId = req.query.userId.toString();
      const cardId = req.query.cardId.toString();
      const timeStamp = req.query.timeStamp.toString();
      const response: GenericServerResponse = await handleGetSentence({ wordsToSearch: wordsToSearch, targetLanguage: targetLanguage, targetLevel: targetLevel, userId: userId, cardId: cardId, timeStamp: timeStamp}, dynamoDbClient, openai);
      res.status(response.status).send(response.body);
}