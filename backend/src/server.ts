import express, { Application } from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import cors from "cors";
import bcrypt from "bcrypt";

import { open, rm } from "node:fs/promises";
import https from "https";

import { PutObjectCommand, DeleteObjectCommand, S3Client, DeleteObjectCommandInput } from "@aws-sdk/client-s3";

import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  PutItemCommandInput,
  UpdateItemCommandInput,
  QueryCommandInput,
  DeleteItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";

import appConfig from "./config";
import * as sh from "./server-helpers";
import * as ah from "./auth-helpers";

export const s3Client: S3Client = new S3Client({
  credentials: fromEnv(),
  region: "ca-central-1",
});

export const dynamoDbClient: DynamoDBClient = new DynamoDBClient({
  credentials: fromEnv(),
  region: "ca-central-1",
});

export const app: Application = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const maxAge = 3 * 24 * 60 * 60;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAIChatCompletion = async (model, temperature, messages) => {
  const response = await openai.chat.completions.create({
    model: model,
    temperature: temperature,
    messages,
  });
  return response
}

const putItemFlashCardTable = async (userId, timeStamp, cardId, response, messages) => {
  const awsInput: PutItemCommandInput = {
    Item: {
      UserId: { S: userId },
      TimeStamp: { S: new String(timeStamp).toString() },
      FlashCardId: { S: cardId },
      TextCompletionCreated: { N: new String(response.created).toString() },
      TextPrompt: { S: messages[0].content },
      TextModel: { S: "gpt-3.5-turbo" },
      Content: { S: response.choices[0].message.content },
      FinishReason: { S: response.choices[0].finish_reason },
      PromptTokens: { N: new String(response.usage.prompt_tokens).toString() },
      CompletionTokens: { N: new String(response.usage.completion_tokens).toString() },
      TotalTokens: { N: new String(response.usage.total_tokens).toString() },
    },
    TableName: "FlashCardGenAITable",
  };
  const awsCommand = new PutItemCommand(awsInput);
  await dynamoDbClient.send(awsCommand);
}

app.get("/service/readyz", (req, res) => res.status(200).json({ readyz: {status: "ok" }}));
app.get("/service/livez", (req, res) => res.status(200).json({ livez: {status: "ok" }}));
app.get("/generations/sentences", async (req, res) => {
  const status = ah.authenticateToken(req)
    if (status != 200) {
      res.sendStatus(status);
      return;
  }
  const userName = ah.authorizeToken(req);
    if (userName == "Unauthorized") {
      res.sendStatus(400);
      return;
  }
  try {
    const wordsToSearch = Array.isArray(req.query.word)
      ? req.query.word
      : [req.query.word];
    const targetLanguage = req.query.lang_mode;
    if (!sh.validateLang(targetLanguage)) {
      res.status(400).send({status: 400, message: `Unsupported language: ${targetLanguage}`})
      return
    }
    let invalidWords = "";
    for (let word of wordsToSearch) {
      if (!(sh.validateWord(word, targetLanguage))) {
        invalidWords = invalidWords + ` ${word}`;
      }
    }
    if (invalidWords !== "") {
      res.status(400).send({status: 400, message: `Invalid words:${invalidWords}`})
      return
    }
    let targetLevel = req.query.lang_level;
    if (!(sh.validateLangLevel(targetLanguage, targetLevel))) {
      res.status(400).send({status: 400, message: `Invalid language level: ${targetLevel}`})
      return
    }
    const userId = userName;
    const cardId = req.query.cardId;
    const timeStamp = req.query.timeStamp;
    const messages = [];
    let cert = " ";
    if (targetLanguage === appConfig.languageModes.SPANISH) {
      cert = cert.concat("DELE");
    } else if (targetLanguage === appConfig.languageModes.FRENCH) {
      if (targetLevel !== undefined) {
        if (["C1", "C2"].includes(targetLevel.toString())) {
          cert = cert.concat("DALF");
        } else {
          cert = cert.concat("DELF");
        }
      }
    } else if (targetLanguage == appConfig.languageModes.KOREAN) {
      if (targetLevel !== undefined) {
        targetLevel = `${targetLevel.toString().slice(0, -1)} ${targetLevel.toString().slice(-1)}`;
        if (["1", "2"].includes(targetLevel.slice(-1))) {
          cert = cert.concat("TOPIK I");
        } else {
          cert = cert.concat("TOPIK II");
        }
        targetLevel = `(${targetLevel})`;
      }
    }
    for (let wordToSearch of wordsToSearch) {
      messages.push({
        role: "user",
        content: `Please create 1 example sentence under 100 words in length showing how the word ${wordToSearch} is commonly used in ${targetLanguage}. Use${
          cert === " " ? "" : cert
        } ${targetLevel} vocabulary and grammar points. Return the sentence in the following JSON format {"word": "${wordToSearch}","sampleSentence": "Example sentence using ${wordToSearch}","translatedSampleSentence":"English translation of the example sentence","wordTranslated": "English translation of ${wordToSearch}"}.`,
      });
    }
    const response = await openAIChatCompletion("gpt-3.5-turbo", 1, messages);
    if (response.id) {
      res.status(200).send({content: response.choices[0].message.content});
      await putItemFlashCardTable(userId, timeStamp, cardId, response, messages)
      return
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({error: err})
  }
});
app.get("/generations/images", async (req, res) => {
  try {
    const status = ah.authenticateToken(req)
    if (status != 200) {
      res.sendStatus(status);
      return;
    }
    const word = req.query.word;
    const langMode = req.query.lang_mode;
    // not a fool-proof check but good for learning purposes
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
    const sentenceToVisualize = req.query.sentence;
    const cardId = req.query.cardId[0];
    const prompt = `${sentenceToVisualize}, Georges Seurat, Bradshaw Crandell, vibrant colors, realistic`;
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "256x256",
    });
    if (response?.created) {
      res.status(200).send(response);
      const input: UpdateItemCommandInput = {
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
      };
      const command = new UpdateItemCommand(input);
      await dynamoDbClient.send(command);
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
});

app.post("/image", async (req, res) => {
  try {
    const status = ah.authenticateToken(req);
    if (status != 200) {
      res.sendStatus(status);
      return;
    }
    const userName = ah.authorizeToken(req);
    if (userName == "Unauthorized") {
      res.sendStatus(400);
      return;
    }
    // Download image
    const userId = userName;
    const imgUrl = req.body.imgUrl;
    const imgName = req.body.imgName;
    const cardId = req.body.cardId;
    const localFileName = `./private/images/${imgName}.png`;
    const remoteFileName = `users/${userName}/images/${imgName}.png`;

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
        const input = {
          // PutObjectRequest
          Body: stream,
          Bucket: process.env.BUCKET_NAME, // required
          Key: remoteFileName, // required
          // ACL: "public-read", // w/o OAC
          ContentType: "image/png",
          CacheControl: "public, max-age=31536000",
        };
        const command = new PutObjectCommand(input);
        await s3Client.send(command);
        stream.close();
        // TODO: Update DynamoDB Table with correct image link
        const ddbInput: UpdateItemCommandInput = {
          Key: { FlashCardId: { S: cardId } },
          TableName: "FlashCardGenAITable",
          UpdateExpression:
            "SET ImageLink = :imgl",
          ExpressionAttributeValues: {
            ":imgl": { S: remoteFileName },
          },
          ReturnValues: "ALL_NEW",
        };
        const ddbCommand = new UpdateItemCommand(ddbInput);
        await dynamoDbClient.send(ddbCommand);
      });
    });
    const domainName = process.env.CLOUDFRONT_URL;
    // const domainName = `https://${process.env.BUCKET_NAME}.s3.ca-central-1.amazonaws.com`
    res.status(200).send({ url: `${domainName}/${remoteFileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).send({error: err})
  }
});

app.get("/flashcards", async (req, res) => {
  try {
    const status = ah.authenticateToken(req);
    if (status != 200) {
      res.sendStatus(status);
      return;
    }
    const userName = ah.authorizeToken(req);
    if (userName == "Unauthorized") {
      res.sendStatus(400);
      return;
    }
    const userId: string = userName;
    const input: QueryCommandInput = {
      TableName: "FlashCardGenAITable",
      IndexName: "UserId",
      Select: "SPECIFIC_ATTRIBUTES",
      KeyConditionExpression: "UserId = :u",
      ExpressionAttributeValues: { ":u": { S: userId } },
      ProjectionExpression: "#T, FlashCardId, Content, ImageLink",
      ExpressionAttributeNames: { "#T": "TimeStamp" },
    };
    const command = new QueryCommand(input);
    const awsResponse = await dynamoDbClient.send(command);
    res.status(200).send({"cards": awsResponse.Items});
  } catch (err) {
    console.error(err);
    res.status(500).send({error: err})
  }
});

app.delete("/flashcard", async (req, res) => {
  try {
    const status = ah.authenticateToken(req);
    if (status != 200) {
      res.sendStatus(status);
      return;
    }
    const userName = ah.authorizeToken(req);
    if (userName == "Unauthorized") {
      res.sendStatus(400);
      return;
    }
    const cardId = req.body.cardId;
    const input = { // GetItemInput
      TableName: "FlashCardGenAITable", // required
      Key: { // Key // required
        FlashCardId: { // AttributeValue Union: only one key present
          S: cardId,
        },
      },
      ConsistentRead: true,
    };
    const command = new GetItemCommand(input);
    const response = await dynamoDbClient.send(command);
    if (userName != response.Item.UserId.S) {
      res.status(400).json({message: `${userName} is unauthorzed to delete flashcard`});
      return;
    }
    // delete image
    const s3Input: DeleteObjectCommandInput = {
      Bucket: process.env.BUCKET_NAME,
      Key: response.Item.ImageLink.S,
    }
    const s3Command = new DeleteObjectCommand(s3Input);
    try {
      await s3Client.send(s3Command);
    } catch (err) {
      console.error(err);
    }
    // delete dynamodb item with text
    let ddbInput: DeleteItemCommandInput = {
      TableName: "FlashCardGenAITable",
      Key: {
        FlashCardId: {S : cardId},
      },
    }
    let ddbCommand = new DeleteItemCommand(ddbInput);
    await dynamoDbClient.send(ddbCommand);
    res.status(200).send({cardId: cardId});
  } catch (err) {
    console.error(err);
    res.status(500).send({error: err})
  }
});

app.delete("/image", async (req, res) => {
  // delete dynamodb item with text
  // delete image
});

// update the flashcard
app.put("/flashcard", async (req, res) => {
  // update dynamodb item with text
  // delete old image
  // upload new image
  // update dynamodb item with new image
});

app.post("/signup", async (req, res) => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  // Check if user exists in the DB first
  const input = { // GetItemInput
    TableName: "UserTable", // required
    Key: { // Key // required
      UserId: { // AttributeValue Union: only one key present
        S: username,
      },
    },
    ConsistentRead: true,
  };
  const command = new GetItemCommand(input);
  const response = await dynamoDbClient.send(command);
  // user already exists, don't let them create a new user
  if (response.Item) {
    res.status(400).send(`User ${username} already exists`);
    return;
  }
  const token = ah.generateAccessToken({ username: username });
  // Store the user and credentials in the DB
  const hashRes = await bcrypt.hash(password, 10)
  const awsInput: PutItemCommandInput = {
    Item: {
      UserId: { S: username },
      AccessToken: {S: token},
      Password: {S: hashRes},
      Role: {S: "learner"},
    },
    TableName: "UserTable",
  };
  const awsCommand = new PutItemCommand(awsInput);
  await dynamoDbClient.send(awsCommand);
  res.setHeader("Set-Cookie", `fc_jwt=${token}; Max-Age=${maxAge*1000}`);
  res.status(201).json({Token: token});
});

app.post("/login", async (req, res) => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  // Check if user exists in the DB first
  const input = { // GetItemInput
    TableName: "UserTable", // required
    Key: { // Key // required
      UserId: { // AttributeValue Union: only one key present
        S: username,
      },
    },
    ConsistentRead: true,
  };
  const command = new GetItemCommand(input);
  const response = await dynamoDbClient.send(command);
  // user already exists, don't let them create a new user
  if (response.Item === undefined) {
    res.status(400).send(`Incorect username or password`);
    return;
  }
  // confirm the password
  const compareRes = await bcrypt.compare(password, response.Item.Password.S);
  if (compareRes) { // login succesful
    const token = ah.generateAccessToken({ username: username });
    res.setHeader("Set-Cookie", `fc_jwt=${token}; Max-Age=${maxAge*1000}`);
    res.status(200).send(`${username} logged in successfully`);
    return;
  } else {
    res.status(400).send(`Incorect username or password`);
    return;
  }
});

app.post("/logout", async (req, res) => {
  try {
    res.setHeader("Set-Cookie", `fc_jwt=""; Max-Age=${1}`);
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
});