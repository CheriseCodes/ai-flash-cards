import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { open, rm } from "node:fs/promises";
import https from "https";

import { dynamoDbClient, s3Client } from "./clients/aws";
import { openai } from "./clients/openai";
import { jwtCheck } from "./clients/auth0";

import { dynamoDb, s3 } from "./classes/aws";

import { ObjectCannedACL } from "@aws-sdk/client-s3";

import appConfig from "./config";
import * as sh from "./server-helpers";
import { ChatCompletion } from "openai/resources/index.mjs";

export const app: Application = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const s3Singleton: s3 = new s3(s3Client);
const dynamoDbSingleton: dynamoDb = new dynamoDb(dynamoDbClient)

const openAIChatCompletion = async (model, temperature, messages) => {
  const response: ChatCompletion = await openai.chat.completions.create({
    model: model,
    temperature: temperature,
    messages,
  });
  return response
}

const authMiddleware = jwtCheck;

const putItemFlashCardTable = async (userId, timeStamp, cardId, response, messages) => {
   await dynamoDbSingleton.putItem({
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
  })
}

app.get("/service/readyz", (req, res) => res.status(200).json({ readyz: {status: "ok" }}));
app.get("/service/livez", (req, res) => res.status(200).json({ livez: {status: "ok" }}));
app.get("/generations/sentences", authMiddleware, async (req, res) => {
  try {

    // check for undefined values
    if ((typeof(req.query.word) == 'undefined') || (typeof(req.query.word[0]) == 'undefined')) {
      res.status(400).send({error: `Word to generate is undefined`})
      return
    }
    if (typeof(req.query.lang_mode) == 'undefined') {
      res.status(400).send({error: `Target language is undefined`})
      return
    }
    if (typeof(req.query.userId) == 'undefined') {
      res.status(400).send({error: `User ID is undefined`})
      return
    }
    if (typeof(req.query.cardId) == 'undefined') {
      res.status(400).send({error: `Flash card ID is undefined`})
      return
    }
    if (typeof(req.query.timeStamp) == 'undefined') {
      res.status(400).send({error: `Flash card timestamp is undefined`})
      return
    }
    const wordsToSearch = Array.isArray(req.query.word)
      ? req.query.word
      : [req.query.word];
    const targetLanguage = req.query.lang_mode;
    let targetLevel = req.query.lang_level;
    const userId = req.query.userId;
    const cardId = req.query.cardId;
    const timeStamp = req.query.timeStamp;
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
    
    if (!(sh.validateLangLevel(targetLanguage, targetLevel))) {
      res.status(400).send({status: 400, message: `Invalid language level: ${targetLevel}`})
      return
    }

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
app.get("/generations/images", authMiddleware, async (req, res) => {
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
});

app.post("/image", authMiddleware, async (req, res) => {
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
});

app.get("/callback", async (req, res) => {
  res.send({"data": "callback"});
});

app.get("/flashcards", authMiddleware, async (req, res) => {
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
});

app.delete("/flashcard", authMiddleware, async (req, res) => {
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
      };
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
