import { Request, Response } from 'express';
import { dynamoDb, s3 } from "../classes/aws";
import { dynamoDbClient, s3Client } from "../clients/aws";
import { validateDeleteFlashcardRequest, validateGetFlashcardsByUserRequest } from "../helpers/validators";
import { handleDeleteFlashcard, handleGetFlashcardsByUser } from '../handlers/flashcards-handlers';
import { GenericServerResponse } from '../../types/global';

const s3ClientInstance: s3 = new s3(s3Client);
const dynamoDbClientInstance: dynamoDb = new dynamoDb(dynamoDbClient);
 
export const getFlashcardsByUser =  async (req: Request, res: Response) => {
  // check for undefined values
  const reqError: GenericServerResponse = validateGetFlashcardsByUserRequest(req)
  if (reqError) {
    res.status(reqError.status).send(reqError.body);
  }
  const userId: string = req.query.userId[0];
  const response: GenericServerResponse = await handleGetFlashcardsByUser({userId: userId}, dynamoDbClientInstance);
  res.status(response.status).send(response.body);
}

export const deleteFlashcard =  async (req: Request, res: Response) => {
    // check for undefined values
    const reqError: GenericServerResponse = validateDeleteFlashcardRequest(req)
    if (reqError) {
      res.status(reqError.status).send(reqError.body);
    }
    const userId = req.body.userId;
    const cardId = req.body.cardId;
    const response: GenericServerResponse = await handleDeleteFlashcard({ userId: userId, cardId: cardId }, dynamoDbClientInstance, s3ClientInstance);
    res.status(response.status).send(response.body);
}

// export const getFlashcard =  async (req: Request, res: Response) => {
//    // TODO
// }