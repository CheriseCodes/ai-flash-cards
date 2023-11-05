import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import cors from "cors";

import { open } from "node:fs/promises";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
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

// TODO: Store generated responses in a database
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TODO: 3rd endpoint to store image in S3 and replace the ImageLink in the DynamoDB table
//       with the s3 url
app.post("/openai/test/text", async (req, res) => {
  try {
    const wordsToSearch = Array.isArray(req.query.word)
      ? req.query.word
      : [req.query.word];
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
    for (let wordToSearch of wordsToSearch) {
      messages.push({
        role: "user",
        content: `Please create 1 example sentence under 100 words in length showing how the word ${wordToSearch} is commonly used in ${targetLanguage}. Use${
          cert === " " ? "" : cert
        } ${targetLevel} vocabulary and grammar points. Return the sentence in the following JSON format {"word": "${wordToSearch}","sampleSentence": "Example sentence using ${wordToSearch}","translatedSampleSentence":"English translation of the example sentence","wordTranslated": "English translation of ${wordToSearch}"}.`,
      });
    }
    console.log("promt for text:", messages[0].content);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 1,
      messages,
    });
    console.log(response.choices[0].message.content);
    if (response.id) {
      console.log(response.choices[0].message.content);
      res.send(response);
      const awsInput = {
        Item: {
          User: { S: userId },
          TimeStamp: { S: new String(timeStamp) },
          FlashCard: { S: cardId },
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

// TODO: Store images in database because can't access them without being signed into OpenAI
app.post("/openai/test/imagine", async (req, res) => {
  try {
    const sentenceToVisualize = req.query.sentence;
    const userId = req.body.userId;
    const cardId = req.body.cardId;
    console.log("visualizing...", sentenceToVisualize);
    // TODO: Try add more American illustrators - https://www.christies.com/en/stories/that-s-america-a-collector-s-guide-to-american-il-a870d242cd3a4c6784cd603427d4d83a
    const prompt = `${sentenceToVisualize}, Norman Rockwell illustration style, Claude Monet painting style, vibrant colors, realistic, London, Toronto, Melbourne, Cape Town, Shanghai`;
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "256x256",
    });
    console.log(response);
    if (response?.created) {
      res.send(response);
      const input = {
        Key: { FlashCard: { S: cardId } },
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

app.get("/openai-test", async (req, res) => {
  try {
    const wordToSearch = req.query.word;
    const mockJson = {
      id: wordToSearch,
      object: "chat.completion",
      created: 1690999999,
      model: "gpt-3.5-turbo-0613",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              '{"word": "먹다","kr": "오늘 저녁에 친구랑 먹다가 영화를 볼 계획이에요.","en": "I plan to eat with my friend tonight and watch a movie."}',
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 77, completion_tokens: 61, total_tokens: 138 },
    };
    res.json(mockJson);
  } catch (e) {
    console.error(e);
  }
});

app.get("/download/dalle", async (req, res) => {
  res.send({ Hello: "World" });
});

app.get("/aws/test", async (req, res) => {
  try {
    // Read content of downloaded file
    const fd = await open("/home/image.png");
    // Create a stream from some character device.
    const stream = fd.createReadStream();
    const input = {
      // PutObjectRequest
      Body: stream,
      Bucket: "bucket_name", // required
      Key: "image.png", // required
    };
    // const command = new ListTablesCommand(input)
    // const response = await dynamoDbClient.send(command);
    const command = new PutObjectCommand(input);
    const response = await s3Client.send(command);

    res.send(response);
    stream.close(); // This may not close the stream.
    // Artificially marking end-of-stream, as if the underlying resource had
    // indicated end-of-file by itself, allows the stream to close.
    // This does not cancel pending read operations, and if there is such an
    // operation, the process may still not be able to exit successfully
    // until it finishes.
    // stream.push(null);
    // stream.read(0);
  } catch (e) {
    res.send(e);
    console.error(e);
  }
});

// TODO: Add method for retrieving all the items in the database that belong to
//       a single user

app.listen(PORT, () => console.log("server is running on port " + PORT));
