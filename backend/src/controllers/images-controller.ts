import { Request, Response } from 'express';
import { dynamoDbClient, s3Client } from "../clients/aws";
import { openai } from "../clients/openai";
import { validateGetImage, validatePostImage } from '../helpers/validators';
import { GenericServerResponse } from '../../types/global';
import { handleGetImage, handlePostImage } from '../handlers/images-handlers';

export const getImage = async (req: Request, res: Response) => {
   const reqError: GenericServerResponse = validateGetImage(req)
   if (reqError) {
    res.status(reqError.status).send(reqError.body);
    return
   }
   const sentenceToVisualize = new String(req.query.sentence).toString();
   const cardId: string = req.query.cardId[0];
   const response: GenericServerResponse = await handleGetImage({ sentence: sentenceToVisualize, cardId: cardId }, dynamoDbClient, openai);
    res.status(response.status).send(response.body);
};

export const postImage = async (req: Request, res: Response) => {
  const reqError: GenericServerResponse = validatePostImage(req)
  if (reqError) {
   res.status(reqError.status).send(reqError.body);
   return
  }
  const userId = req.body.userId;
  const imgUrl = req.body.imgUrl;
  const imgName = req.body.imgName;
  const cardId = req.body.cardId;
  // const localFileName = `./private/images/${imgName}.png`;
  const remoteFileName = `users/${userId}/images/${imgName}.png`;
  const response: GenericServerResponse = await handlePostImage({ cardId: cardId, remoteFileName: remoteFileName, imgUrl: imgUrl }, dynamoDbClient, s3Client);
  res.status(response.status).send(response.body);
}

// export const deleteImage = async (req: Request, res: Response)  => {
// // delete dynamodb item with text
// // delete image
// }