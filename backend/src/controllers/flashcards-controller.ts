import { Request, Response } from 'express';
import { dynamoDbClient, s3Client } from "../clients/aws";
import { validateDeleteFlashcardRequest, validateGetFlashcardsByUserRequest } from "../helpers/validators";
import { handleDeleteFlashcard, handleGetFlashcardsByUser } from '../handlers/flashcards-handlers';
import { GenericServerResponse } from '../../types/global';
 
export const getFlashcardsByUser =  async (req: Request, res: Response) => {
  // TODO: start time
  // check for undefined values
  console.log("entered getFlashcards")
  const reqError: GenericServerResponse = validateGetFlashcardsByUserRequest(req)
  if (reqError) {
    res.status(reqError.status).send(reqError.body);
    // TODO: end time 
    // TODO: put metric method=GET route=/flashcards status=reqError.status latency=end-start
    return
  }
  console.log("passed input verification")
  const userId: string = req.query.userId[0];
  const response: GenericServerResponse = await handleGetFlashcardsByUser({userId: userId}, dynamoDbClient);
  console.log("received response")
  res.status(response.status).send(response.body);
  // TODO: end time
  // TODO: put metric method=GET route=/flashcards status=response.status latency=end-start
}

export const deleteFlashcard =  async (req: Request, res: Response) => {
    // check for undefined values
    const reqError: GenericServerResponse = validateDeleteFlashcardRequest(req)
    if (reqError) {
      res.status(reqError.status).send(reqError.body);
      return
    }
    const userId: string = req.body.userId;
    const cardId: string = req.body.cardId;
    const response: GenericServerResponse = await handleDeleteFlashcard({ userId: userId, cardId: cardId }, dynamoDbClient, s3Client);
    res.status(response.status).send(response.body);
}

// export const getFlashcard =  async (req: Request, res: Response) => {
//    // TODO
// }