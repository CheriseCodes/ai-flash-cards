import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { open, rm } from "node:fs/promises";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import https from "https";

import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";

import appConfig from "./src/config.js";

const s3Client = new S3Client({
  credentials: fromSSO({ profile: process.env.AWS_PROFILE }),
  region: "ca-central-1",
});
const dynamoDbClient = new DynamoDBClient({
  credentials: fromSSO({ profile: process.env.AWS_PROFILE }),
  region: "ca-central-1",
});

const PORT = 8000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO: 3rd endpoint to store image in S3 and replace the ImageLink in the DynamoDB table
//       with the s3 url
app.post("/openai/test/text", async (req, res) => {
  try {
    const wordsToSearch = Array.isArray(req.query.word)
      ? req.query.word
      : [req.query.word];
    const wordToSearch = wordsToSearch
    const targetLanguage = req.query.lang_mode;
    let targetLevel = req.query.lang_level;
    const userId = req.body.userId;
    const cardId = req.body.cardId;
    const timeStamp = req.body.timeStamp;
    console.log("userid", userId, "cardid", cardId, "timeStamp", timeStamp);
    const messages = [];
    let cert = " ";
    if (targetLanguage === appConfig.languageModes.SPANISH) {
      cert = cert.concat("DELE");
    } else if (targetLanguage === appConfig.languageModes.FRENCH) {
      if (["C1", "C2"].includes(targetLevel)) {
        cert = cert.concat("DALF");
      } else {
        cert = cert.concat("DELF");
      }
    } else if (targetLanguage == appConfig.languageModes.KOREAN) {
      targetLevel = `${targetLevel.slice(0, -1)} ${targetLevel.slice(-1)}`;
      if (["1", "2"].includes(targetLevel.slice(-1))) {
        cert = cert.concat("TOPIK I");
      } else {
        cert = cert.concat("TOPIK II");
      }
      targetLevel = `(${targetLevel})`;
    }
    const response = {id: 123, choices:[{ message: {content: JSON.stringify({word: `${wordToSearch}`,sampleSentence: `Example sentence using ${wordToSearch} in ${targetLanguage} at level ${targetLevel}`,translatedSampleSentence:"English translation of the example sentence",wordTranslated: `English translation of ${wordToSearch}`})}}]}
    if (response.id) {
      res.send(response);
      const awsInput = {
        Item: {
          UserId: { S: userId },
          TimeStamp: { S: new String(timeStamp) },
          FlashCardId: { S: cardId },
          TextCompletionCreated: { N: new String(response.created) },
          TextPrompt: { S: messages[0].content },
          TextModel: { S: "gpt-3.5-turbo" },
          Content: { S: response.choices[0].message.content },
          FinishReason: { S: response.choices[0].finish_reason },
          PromptTokens: { N: new String(response.usage.prompt_tokens) },
          CompletionTokens: { N: new String(response.usage.completion_tokens) },
          TotalTokens: { N: new String(response.usage.total_tokens) },
        },
        TableName: "FlashCardGenAITable",
      };

      console.log(awsInput);
      const awsCommand = new PutItemCommand(awsInput);
      const awsResponse = await dynamoDbClient.send(awsCommand);
      console.log(awsResponse);
    }
  } catch (err) {
    console.error(err);
  }
});

app.post("/openai/test/imagine", async (req, res) => {
  try {
    const sentenceToVisualize = req.query.sentence;
    const userId = req.body.userId;
    const cardId = req.body.cardId;
    console.log("visualizing...", sentenceToVisualize);
    const response = {
      created: Date.now(),
      data: [
        {
          url: "https://picsum.photos/256.jpg"
        }
      ]
    }
    console.log(response);
    if (response?.created) {
      res.send(response);
      const input = {
        Key: { FlashCardId: { S: cardId } },
        TableName: "FlashCardGenAITable",
        UpdateExpression:
          "SET ImageCreated = :imgc, ImagePrompt = :imgp, ImageModel = :imgm, ImageLink = :imgl",
        ExpressionAttributeValues: {
          ":imgc": { N: new String(response.created) },
          ":imgp": { S: prompt },
          ":imgm": { S: "DALLE2" },
          ":imgl": { S: response.data[0].url },
        },
        ReturnValues: "ALL_NEW",
      };
      const command = new UpdateItemCommand(input);
      const awsResponse = await dynamoDbClient.send(command);
    }
  } catch (e) {
    console.error(e);
    res.send({
      created: 400,
      data: [
        {
          url: "https://m.media-amazon.com/images/I/418Jmnejj8L.jpg",
        },
      ],
    });
  }
});

const createPresignedUrlWithClient = ({ client, bucket, key }) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

app.post("/upload/image", async (req, res) => {
  try {
    // Download image
    const imgUrl = req.body.imgUrl;
    const localFileName = "./private/images/download.png";
    const remoteFileName = "users/default/images/img3.png";
    console.log(imgUrl);

    https.get(imgUrl, async (res) => {
      const fdWrite = await open(localFileName, "w");
      const writeStream = res.pipe(fdWrite.createWriteStream());
      writeStream.on("finish", async () => {
        // Read content of downloaded file
        const fdRead = await open(localFileName);
        // Create a stream from some character device.
        const stream = fdRead.createReadStream();
        const input = {
          // PutObjectRequest
          Body: stream,
          Bucket: "openai-dalle-s3-40d44616", // required
          Key: remoteFileName, // required
        };
        const command = new PutObjectCommand(input);
        const s3Response = await s3Client.send(command);
        console.log(s3Response);
        stream.close();
      });
    });
    const signedUrl = await createPresignedUrlWithClient({
      client: s3Client,
      bucket: "openai-dalle-s3-40d44616",
      key: remoteFileName,
    });
    res.send({ url: signedUrl });
    rm(localFileName);
  } catch (e) {
    res.send(e);
    console.error(e);
  }
});

app.post("/flashcards", async (req, res) => {
  try {
    const userId = req.body.userId;
    const input = {
      TableName: "FlashCardGenAITable",
      IndexName: "UserId",
      Select: "SPECIFIC_ATTRIBUTES",
      KeyConditionExpression: "UserId = :u",
      ExpressionAttributeValues: { ":u": { S: userId } },
      ProjectionExpression: "#T, FlashCardId, Content, ImageLink",
      ExpressionAttributeNames: {"#T" : "TimeStamp" },
    };
    const command = new QueryCommand(input);
    const awsResponse = await dynamoDbClient.send(command);
    res.send(awsResponse.Items);
  } catch (e) {
    console.error(e);
  }
});

app.listen(PORT, () => console.log("server is running on port " + PORT));
