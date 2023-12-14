import { describe, test, beforeEach, afterEach, mock, before, after } from 'node:test';
import assert from 'node:assert';
import { mockClient } from "aws-sdk-client-mock";
import { dynamoDbClient, s3Client, openai, app } from '../src/server';

const PORT = 8000;

const ddbMock = mockClient(dynamoDbClient);
const s3Mock = mockClient(s3Client);

describe("POST /flashcards", () => {
    let server;
    beforeEach(() => {
      ddbMock.reset()
      s3Mock.reset()
    })
    afterEach(() => {
      ddbMock.restore()
      s3Mock.restore()
    })
    before(() => {
      server = app.listen(PORT, () => console.log("server is running on port " + PORT));
    })
    after(() => {
      server.close()
    })
    test("existent user should have non-empty cards response", async () => {
          const queryResult = {Items: [{"Content":{"S":"{\"word\":\"hello\",\"sampleSentence\":\"Example sentence using hello in French at level B2\",\"translatedSampleSentence\":\"English translation of the example sentence\",\"wordTranslated\":\"English translation of hello\"}"},"ImageLink":{"S":"https://picsum.photos/256"},"TimeStamp":{"S":"1700536327774"},"FlashCardId":{"S":"15685288-110f-4ce0-8bfb-edd18489b6eb"}}]};
          ddbMock.onAnyCommand().resolves(queryResult)
          s3Mock.onAnyCommand().resolves({})
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
          assert.deepStrictEqual(json, {cards: queryResult.Items})
      });
});

describe("POST /openai/test/text", () => {
    let server;
    beforeEach(() => {
      ddbMock.reset()
      s3Mock.reset()
    })
    before(()=> {
      server = app.listen(PORT, () => console.log("server is running on port " + PORT));
    })
    after(() => {
      server.close()
    })
  
  test("invalid word should return an empty response", async () => {
      ddbMock.onAnyCommand().resolves({})
      s3Mock.onAnyCommand().resolves({})
      const word = "hello"; // invalid word
      const userId = "default";
      const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9"
      const languageMode = "French";
      const languageLevel = "A1";
      const timeStamp = Date.now()
      mock.method(openai.chat.completions, 'create', () => {return {
        id: 123,
        created: 123,
        usage: {
          prompt_tokens: 123,
          completion_tokens: 123,
          total_tokens: 123,
        },
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                word: `${word}`,
                sampleSentence: `Example sentence using ${word} in ${languageMode}} at level ${languageLevel}`,
                translatedSampleSentence:
                  "English translation of the example sentence",
                wordTranslated: `English translation of ${word}`,
              }),
            },
          },
        ],
      };})
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
  });
  test("unsupported language should return an empty response", async () => {
      // ddbMock.onAnyCommand().resolves({})
      // s3Mock.onAnyCommand().resolves({})
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
  });
  test("invalid language level should return an empty response", async () => {
      // ddbMock.onAnyCommand().resolves({})
      // s3Mock.onAnyCommand().resolves({})
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
      assert.deepStrictEqual(json, {status: 400, message: 'Invalid language level: G2'});
  });
  test("valid input should return JSON stringified response with correct key values", async () => {
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
  });
});