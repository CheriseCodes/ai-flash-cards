import { dynamoDb, s3 } from '../classes/aws';
import { GenericServerResponse } from '../../types/global';
import { GenAIClient } from "../classes/abstract";
import { unixTimestamp } from "../helpers/utils";
import { open, rm } from "node:fs/promises";
import https from "https";
import { ObjectCannedACL } from "@aws-sdk/client-s3";

interface handleGetImageInput {
  sentence: string;
  cardId: string;
}
export const handleGetImage = async (input: handleGetImageInput, dynamoDbClient: dynamoDb, openaiClient: GenAIClient): Promise<GenericServerResponse> => {
  try {
    const sentenceToVisualize = input.sentence;
    const cardId: string =  input.cardId;
    const prompt = `${sentenceToVisualize}, Georges Seurat, Bradshaw Crandell, vibrant colors, realistic`;
    const response = await openaiClient.generateImage(prompt)
    if (response) {
      const created = unixTimestamp()
      await dynamoDbClient.updateItem({
        Key: { FlashCardId: { S: cardId } },
        TableName: "FlashCardGenAITable",
        UpdateExpression:
          "SET ImageCreated = :imgc, ImagePrompt = :imgp, ImageModel = :imgm, ImageLink = :imgl",
        ExpressionAttributeValues: {
          ":imgc": { N: new String(created).toString() },
          ":imgp": { S: prompt },
          ":imgm": { S: "DALLE2" },
          ":imgl": { S: response },
        },
        ReturnValues: "ALL_NEW",
      });
      return {status: 200, body: {url: response}};
    }
  } catch (err) {
    console.error(err);
    return {status: 500, body: {error: err, created: 400,
      data: [
        {
          url: "https://m.media-amazon.com/images/I/418Jmnejj8L.jpg",
        },
      ]}};
  }
}

interface handlePostImageInput {
  cardId: string;
  imgUrl: string;
  localFileName: string;
  remoteFileName: string;
}
export const handlePostImage = async (input: handlePostImageInput, dynamoDbClient: dynamoDb, s3Client: s3): Promise<GenericServerResponse> => {
  try {
    const domainName = process.env.CLOUDFRONT_URL;
  if (!process.env.NODE_ENV.includes('test')) { // don't run in test environment
    const cardId = input.cardId;
    const imgUrl = input.imgUrl;
    const localFileName = input.localFileName;
    const remoteFileName = input.remoteFileName;
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
        await s3Client.putObject({
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
        await dynamoDbClient.updateItem({
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
    return {status: 200, body: { url: `${domainName}/${remoteFileName}` }};
  }
  // const domainName = `https://${process.env.BUCKET_NAME}.s3.ca-central-1.amazonaws.com`
  return {status: 200, body: { url: `${domainName}/sample.png` }};
} catch (err) {
  console.error(err);
  return {status: 500, body: {error: err}}
}
}