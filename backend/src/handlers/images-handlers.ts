import { dynamoDb, s3 } from '../classes/aws';
import { GenericServerResponse } from '../../types/global';
import { GenAIClient } from "../classes/abstract";
import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { createUrlReadStream } from "../helpers/utils";

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
      const created = response.created
      await dynamoDbClient.updateItem({
        Key: { FlashCardId: { S: cardId } },
        TableName: "FlashCardGenAITable",
        UpdateExpression:
          "SET ImageCreated = :imgc, ImagePrompt = :imgp, ImageModel = :imgm, ImageLink = :imgl",
        ExpressionAttributeValues: {
          ":imgc": { N: new String(created).toString() },
          ":imgp": { S: prompt },
          ":imgm": { S: "DALLE2" },
          ":imgl": { S: response.data[0].url },
        },
        ReturnValues: "ALL_NEW",
      });
      return {status: 200, body: {created: created, data: [{url: response.data[0].url}]}};
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
  // localFileName: string;
  remoteFileName: string;
}
export const handlePostImage = async (input: handlePostImageInput, dynamoDbClient: dynamoDb, s3Client: s3) => {
    const remoteFileName = input.remoteFileName;
    const imgUrl = input.imgUrl;
    const cardId = input.cardId;
      // const domainName = `https://${process.env.BUCKET_NAME}.s3.ca-central-1.amazonaws.com`
    const domainName = process.env.CLOUDFRONT_URL;
    try {
      const readable = createUrlReadStream(imgUrl)
      await s3Client.putObject({
          // PutObjectRequest
          Body: readable,
          Bucket: process.env.BUCKET_NAME, // required
          Key: remoteFileName, // required
          ACL: ObjectCannedACL.public_read,
          ContentType: "image/png",
          CacheControl: "public, max-age=31536000",
      });
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
  return {status: 200, body: { url: `${domainName}/${remoteFileName}` }};
} catch (err) {
  console.error(err);
  return {status: 500, body: {error: err}}
}
}