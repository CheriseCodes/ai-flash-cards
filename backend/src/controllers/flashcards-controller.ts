import { Request, Response } from 'express';
import { dynamoDb, s3 } from "../classes/aws";
import { dynamoDbClient, s3Client } from "../clients/aws";
const s3Singleton: s3 = new s3(s3Client);
const dynamoDbSingleton: dynamoDb = new dynamoDb(dynamoDbClient);
 
export const getFlashcardsByUser =  async (req: Request, res: Response) => {
    try {
        // check for undefined values
        if ((typeof(req.query.userId) == 'undefined') || (typeof(req.query.userId[0]) == 'undefined')) {
          res.status(400).send({error: `User ID is undefined`})
          return
        }
        const userId: string = req.query.userId[0];
        const awsResponse = await dynamoDbSingleton.query({
          TableName: "FlashCardGenAITable",
          IndexName: "UserId",
          Select: "SPECIFIC_ATTRIBUTES",
          KeyConditionExpression: "UserId = :u",
          ExpressionAttributeValues: { ":u": { S: userId } },
          ProjectionExpression: "#T, FlashCardId, Content, ImageLink",
          ExpressionAttributeNames: { "#T": "TimeStamp" },
        });
        res.status(200).send({"cards": awsResponse.Items});
      } catch (err) {
        console.error(err);
        res.status(500).send({error: err});
      }  
}

export const deleteFlashcard =  async (req: Request, res: Response) => {
    try {
        // check for undefined values
        if (typeof(req.body.userId) == 'undefined') {
          res.status(400).send({error: `User ID is undefined`})
          return
        }
        if (typeof(req.body.cardId) == 'undefined') {
          res.status(400).send({error: `Flash card ID is undefined`})
          return
        }
        const userId = req.body.userId;
        const cardId = req.body.cardId;
        const response = await dynamoDbSingleton.getItem({ // GetItemInput
          TableName: "FlashCardGenAITable", // required
          Key: { // Key // required
            FlashCardId: { // AttributeValue Union: only one key present
              S: cardId,
            },
          },
          ConsistentRead: true,
        });
        if (userId != response.Item.UserId.S) {
          res.status(400).json({message: `${userId} is unauthorzed to delete flashcard`});
          return;
        }
        // delete image
        try {
          await s3Singleton.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: response.Item.ImageLink.S,
          });
        } catch (err) {
          console.error(err);
        }
        // delete dynamodb item with text
        await dynamoDbSingleton.deleteItem({
          TableName: "FlashCardGenAITable",
          Key: {
            FlashCardId: {S : cardId},
          },
        });
        res.status(200).send({cardId: cardId});
      } catch (err) {
        console.error(err);
        res.status(500).send({error: err})
      }
}

// export const getFlashcard =  async (req: Request, res: Response) => {
//    // TODO
// }