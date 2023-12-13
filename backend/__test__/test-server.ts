import { describe, test } from 'node:test';
import assert from 'node:assert';
// import {
//   DynamoDBClient,
//   QueryCommand,
//   PutItemCommand,
//   UpdateItemCommand,
// } from "@aws-sdk/client-dynamodb";
// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { mockClient } from "aws-sdk-client-mock";

const PORT = 8000;

// const mockS3 = mockClient(PutObjectCommand);
// const mockDdb = mockClient(DynamoDBClient);

describe("POST /flashcards", () => {
    test("existent user should have cards cards", async () => {
        setTimeout(async () => {
          const queryResult = [];
          // const queryResult = [{"Content":{"S":"{\"word\":\"hello\",\"sampleSentence\":\"Example sentence using hello in French at level B2\",\"translatedSampleSentence\":\"English translation of the example sentence\",\"wordTranslated\":\"English translation of hello\"}"},"ImageLink":{"S":"https://picsum.photos/256"},"TimeStamp":{"S":"1700536327774"},"FlashCardId":{"S":"15685288-110f-4ce0-8bfb-edd18489b6eb"}}]
          // mockDdb.on(QueryCommand).resolves({Items: queryResult})
          const userId = "default";
          const response = await fetch(
            `http://localhost:${PORT}/flashcards`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
              }),
            },
          );
          const json = await response.json()
          assert.deepStrictEqual(json, {cards: queryResult})
        }, 1000);
      });
});

describe("POST /openai/test/text", () => {
  test("invalid word should return an empty response", () => {
    setTimeout(async () => {
      const word = "hello"; // invalid word
      const userId = "default";
      const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9"
      const languageMode = "French";
      const languageLevel = "A1";
      const timeStamp = Date.now()
      const response = await fetch(
        `http://localhost:${PORT}/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            cardId: cardId,
            timeStamp: timeStamp,
          }),
        },
      );
      const json = await response.json()
      assert.deepStrictEqual(json, {status: 400, message: 'Invalid words: hello'})
      
    }, 1000);
  });
  test("unsupported language should return an empty response", () => {
    setTimeout(async () => {
      const word = "viikko"; // invalid word
      const userId = "default";
      const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9"
      const languageMode = "Finnish";
      const languageLevel = "YKI1";
      const timeStamp = Date.now()
      const response = await fetch(
        `http://localhost:${PORT}/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            cardId: cardId,
            timeStamp: timeStamp,
          }),
        },
      );
      const json = await response.json()
      assert.deepStrictEqual(json, {status: 400, message: 'Unsupported language: Finnish'})
    }, 1000);
  });
  test("invalid language level should return an empty response", () => {
    setTimeout(async () => {
      const word = "être";
      const userId = "default";
      const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9"
      const languageMode = "French";
      const languageLevel = "G2";
      const timeStamp = Date.now()
      const response = await fetch(
        `http://localhost:${PORT}/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            cardId: cardId,
            timeStamp: timeStamp,
          }),
        },
      );
      const json = await response.json()
      assert.deepStrictEqual(json, {status: 400, message: 'Invalid language level: G2'})
    }, 1000);
  });
  test("valid input should return JSON stringified response with correct key values", () => {
    setTimeout(async () => {
      const word = "être";
      const userId = "default";
      const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9"
      const languageMode = "French";
      const languageLevel = "C2";
      const timeStamp = Date.now()
      const response = await fetch(
        `http://localhost:${PORT}/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            cardId: cardId,
            timeStamp: timeStamp,
          }),
        },
      ).catch((err) => {return new Response(new Blob(), {status: err.status, statusText: err.message})});
      const json = await response.json().catch((err) => {return {error: err.error}});
      assert.notStrictEqual(json.content, "");
      const parsedContent = JSON.parse(json.content);
      assert.notStrictEqual(parsedContent.word, "");
      assert.notStrictEqual(parsedContent.sampleSentence, "");
      assert.notStrictEqual(parsedContent.translatedSampleSentence, "");
      assert.notStrictEqual(parsedContent.wordTranslated, "");
    }, 1000);
  });
});

