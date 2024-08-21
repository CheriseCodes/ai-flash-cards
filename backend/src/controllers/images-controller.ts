import { Request, Response } from 'express';
import { open, rm } from "node:fs/promises";
import https from "https";
import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { dynamoDb, s3 } from "../classes/aws";
import { dynamoDbClient, s3Client } from "../clients/aws";
import { openai } from "../clients/openai";
import appConfig from "../config";

const s3Singleton: s3 = new s3(s3Client);
const dynamoDbSingleton: dynamoDb = new dynamoDb(dynamoDbClient);

export const getImage = async (req: Request, res: Response) => {
    try {
      // check for undefined values
      if (typeof(req.query.word) == 'undefined') {
        res.status(400).send({error: `Word to generate is undefined`})
        return
      }
      if (typeof(req.query.lang_mode) == 'undefined') {
        res.status(400).send({error: `Language mode is undefined`})
        return
      }
      if (typeof(req.query.sentence) == 'undefined') {
        res.status(400).send({error: `Sentence to visualize is undefined`})
        return
      }
      if ((typeof(req.query.cardId) == 'undefined') || (typeof(req.query.cardId[0]) == 'undefined')) {
        res.status(400).send({error: `Flash card ID is undefined`})
        return
      }
      const word = req.query.word;
      const langMode = req.query.lang_mode;
      const sentenceToVisualize = req.query.sentence;
      const cardId: string = req.query.cardId[0];
      if (langMode == "Korean") {
        if (!(appConfig.allowedKoreanWords.includes(word.toString()))) {
          res.status(400).send({status: 400, message: `Unsupported word: ${word}`})
          return
        }
      } else if (langMode == "French") {
        if (!(appConfig.allowedFrenchWords.includes(word.toString()))) {
          res.status(400).send({status: 400, message: `Unsupported word: ${word}`})
          return
        }
      } else if (langMode == "Spanish") {
        if (!(appConfig.allowedSpanishWords.includes(word.toString()))) {
          res.status(400).send({status: 400, message: `Unsupported word: ${word}`})
          return
        }
      } else {
        res.status(400).send({status: 400, message: `Unsupported language: ${langMode}`})
        return
      }
      
      const prompt = `${sentenceToVisualize}, Georges Seurat, Bradshaw Crandell, vibrant colors, realistic`;
      const response = await openai.images.generate({
        prompt: prompt,
        n: 1,
        size: "256x256",
      });
      if (response?.created) {
        res.status(200).send(response);
        await dynamoDbSingleton.updateItem({
          Key: { FlashCardId: { S: cardId } },
          TableName: "FlashCardGenAITable",
          UpdateExpression:
            "SET ImageCreated = :imgc, ImagePrompt = :imgp, ImageModel = :imgm, ImageLink = :imgl",
          ExpressionAttributeValues: {
            ":imgc": { N: new String(response.created).toString() },
            ":imgp": { S: prompt },
            ":imgm": { S: "DALLE2" },
            ":imgl": { S: response.data[0].url },
          },
          ReturnValues: "ALL_NEW",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({error: err, created: 400,
        data: [
          {
            url: "https://m.media-amazon.com/images/I/418Jmnejj8L.jpg",
          },
        ]});
    }
};

export const postImage = async (req: Request, res: Response) => {
    try {
      
      // check for undefined values
      if (typeof(req.body.userId) == 'undefined') {
        res.status(400).send({error: `User ID is undefined`})
        return
      }
      if (typeof(req.body.imgUrl) == 'undefined') {
        res.status(400).send({error: `URL of image to upload is undefined`})
        return
      }
      if (typeof(req.body.imgName) == 'undefined') {
        res.status(400).send({error: `Name of image to upload is undefined`})
        return
      }
      if (typeof(req.body.cardId) == 'undefined') {
        res.status(400).send({error: `Flash card ID is undefined`})
        return
      }
      // Download image
      const userId = req.body.userId;
      const imgUrl = req.body.imgUrl;
      const imgName = req.body.imgName;
      const cardId = req.body.cardId;
      const localFileName = `./private/images/${imgName}.png`;
      const remoteFileName = `users/${userId}/images/${imgName}.png`;
  
      if (!process.env.NODE_ENV.includes('test')) { // don't run in test environment
        // TODO: Save data to buffer instead of directly to disk [IMPORTANT]
        https.get(imgUrl, async (res) => {
          const fdWrite = await open(localFileName, "w");
          const writeStream = res.pipe(fdWrite.createWriteStream());
          writeStream.on("finish", async () => {
            // Read content of downloaded file
            const fdRead = await open(localFileName);
            // Create a stream from some character device.
            const stream = fdRead.createReadStream();
            stream.on("close", () => {
              rm(localFileName);
            });
            await s3Singleton.putObject({
              // PutObjectRequest
              Body: stream,
              Bucket: process.env.BUCKET_NAME, // required
              Key: remoteFileName, // required
              ACL: ObjectCannedACL.public_read,
              ContentType: "image/png",
              CacheControl: "public, max-age=31536000",
            });
            stream.close();
            // TODO: Update DynamoDB Table with correct image link
            await dynamoDbSingleton.updateItem({
              Key: { FlashCardId: { S: cardId } },
              TableName: "FlashCardGenAITable",
              UpdateExpression:
                "SET ImageLink = :imgl",
              ExpressionAttributeValues: {
                ":imgl": { S: remoteFileName },
              },
              ReturnValues: "ALL_NEW",
            });
          });
        });
      }
      const domainName = process.env.CLOUDFRONT_URL;
      // const domainName = `https://${process.env.BUCKET_NAME}.s3.ca-central-1.amazonaws.com`
      res.status(200).send({ url: `${domainName}/${remoteFileName}` });
    } catch (err) {
      console.error(err);
      res.status(500).send({error: err})
    }
};

// export const deleteImage = async (req: Request, res: Response)  => {
// // delete dynamodb item with text
// // delete image
// }