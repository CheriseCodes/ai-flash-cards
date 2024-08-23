import { Request, Response } from 'express';
import { validateDeleteFlashcardRequest, validateGetFlashcardsByUserRequest } from '../helpers/validators';
import { dynamoDb, s3 } from '../classes/aws';
import { GenericServerResponse } from '../../types/global';

export const handleGetFlashcardsByUser =  async (req: Request, dynamoDbClient: dynamoDb): Promise<GenericServerResponse> => {
    try {
        // check for undefined values
        const reqError: GenericServerResponse = validateGetFlashcardsByUserRequest(req)
        if (reqError) {
            return reqError
        }
        const userId: string = req.query.userId[0];
        const awsResponse = await dynamoDbClient.query({
          TableName: "FlashCardGenAITable",
          IndexName: "UserId",
          Select: "SPECIFIC_ATTRIBUTES",
          KeyConditionExpression: "UserId = :u",
          ExpressionAttributeValues: { ":u": { S: userId } },
          ProjectionExpression: "#T, FlashCardId, Content, ImageLink",
          ExpressionAttributeNames: { "#T": "TimeStamp" },
        });
        return {status: 200, body:{"cards": awsResponse.Items}};
      } catch (err) {
        console.error(err);
        return {status: 500, body: {error: err}};
      }  
}


export const handleDeleteFlashcard =  async (req: Request, dynamoDbClient: dynamoDb, s3Client: s3): Promise<GenericServerResponse> => {
    try {
        // check for undefined values
        const reqError: GenericServerResponse = validateDeleteFlashcardRequest(req)
        if (reqError) {
            return reqError
        }
        const userId = req.body.userId;
        const cardId = req.body.cardId;
        const response = await dynamoDbClient.getItem({ // GetItemInput
          TableName: "FlashCardGenAITable", // required
          Key: { // Key // required
            FlashCardId: { // AttributeValue Union: only one key present
              S: cardId,
            },
          },
          ConsistentRead: true,
        });
        if (userId != response.Item.UserId.S) {
          return {status: 400, body: {message: `${userId} is unauthorzed to delete flashcard`}}
        }

        // TODO: Check error before returning response
        try {
          // delete image
          await s3Client.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: response.Item.ImageLink.S,
          });
          // delete dynamodb item with text
          await dynamoDbClient.deleteItem({
            TableName: "FlashCardGenAITable",
            Key: {
              FlashCardId: {S : cardId},
            },
          });
          return {status: 200, body: {cardId: cardId}};
        } catch (err) {
          console.error(err);
          return {status: 500, body: {message: "Failed to delete flashcard"}}
        }
      } catch (err) {
        console.error(err);
        return {status: 500, body: {error: err}}
      }
}