import { Request, Response } from 'express';
import { ChatCompletion } from "openai/resources/index.mjs";
import * as sh from "../server-helpers";
import { dynamoDb } from "../classes/aws";
import { openai } from "../clients/openai";
import { dynamoDbClient } from "../clients/aws";
import appConfig from "../config";

const dynamoDbSingleton: dynamoDb = new dynamoDb(dynamoDbClient);

const openAIChatCompletion = async (model, temperature, messages) => {
    const response: ChatCompletion = await openai.chat.completions.create({
      model: model,
      temperature: temperature,
      messages,
    });
    return response
  }

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

 export const getSentence = async (req: Request, res: Response) => {
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
  }