import { dynamoDb, s3 } from '../classes/aws';
import { GenericServerResponse } from '../../types/global';

interface handleGetFlashcardsByUserInput {
    userId: string;
}
export const handleGetFlashcardsByUser =  async (input: handleGetFlashcardsByUserInput, dynamoDbClient: dynamoDb): Promise<GenericServerResponse> => {
    try {
        const awsResponse = await dynamoDbClient.query({
          TableName: "FlashCardGenAITable",
          IndexName: "UserId",
          Select: "SPECIFIC_ATTRIBUTES",
          KeyConditionExpression: "UserId = :u",
          ExpressionAttributeValues: { ":u": { S: input.userId } },
          ProjectionExpression: "#T, FlashCardId, Content, ImageLink",
          ExpressionAttributeNames: { "#T": "TimeStamp" },
        });
        return {status: 200, body:{"cards": awsResponse.Items}};
      } catch (err) {
        console.error(err);
        return {status: 500, body: {error: err}};
      }  
}

interface handleDeleteFlashcardInput {
    userId: string;
    cardId: string;
}
export const handleDeleteFlashcard =  async (input: handleDeleteFlashcardInput, dynamoDbClient: dynamoDb, s3Client: s3): Promise<GenericServerResponse> => {
    try {
        const response = await dynamoDbClient.getItem({ // GetItemInput
          TableName: "FlashCardGenAITable", // required
          Key: { // Key // required
            FlashCardId: { // AttributeValue Union: only one key present
              S: input.cardId,
            },
          },
          ConsistentRead: true,
        });
        if (input.userId != response.Item.UserId.S) {
          return {status: 400, body: {message: `${input.userId} is unauthorzed to delete flashcard`}}
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
              FlashCardId: {S : input.cardId},
            },
          });
          return {status: 200, body: {cardId: input.cardId}};
        } catch (err) {
          console.error(err);
          return {status: 500, body: {message: "Failed to delete flashcard"}}
        }
      } catch (err) {
        console.error(err);
        return {status: 500, body: {error: err}}
      }
}