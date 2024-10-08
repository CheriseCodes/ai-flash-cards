import { describe, test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { app } from "../src/server";
import { s3Client, dynamoDbClient } from "../src/clients/aws";
import { openai } from "../src/clients/openai";

import { GetItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import request from "supertest";

const ddbMock = dynamoDbClient.getMock();
const s3Mock = s3Client.getMock()
const openaiMock = openai.client;
describe("GET /flashcards", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
    mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
    mock.restoreAll();
  });
  test("existent user should have non-empty cards response", async () => {
    const queryResult = {
      Items: [
        {
          Content: {
            S: '{"word":"hello","sampleSentence":"Example sentence using hello in French at level B2","translatedSampleSentence":"English translation of the example sentence","wordTranslated":"English translation of hello"}',
          },
          ImageLink: { S: "https://picsum.photos/256" },
          TimeStamp: { S: "1700536327774" },
          FlashCardId: { S: "15685288-110f-4ce0-8bfb-edd18489b6eb" },
        },
      ],
    };
    ddbMock.onAnyCommand().resolves(queryResult);
    s3Mock.onAnyCommand().resolves({});
    const userId = "default";
    const response = await request(app)
      .get(`/flashcards?userId=${userId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.deepStrictEqual(response.body, { cards: queryResult.Items });
  });
  test("non-existent user should have non-empty cards response", async () => {
    const queryResult = {
      Items: [],
    };
    ddbMock.onAnyCommand().resolves(queryResult);
    s3Mock.onAnyCommand().resolves({});
    const userId = "default";
    const response = await request(app)
      .get(`/flashcards?userId=${userId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.deepStrictEqual(response.body, { cards: queryResult.Items });
  });
});

describe("DELETE /flashcards", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
    mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
    mock.restoreAll();
  });
  test("existing flashcard is deleted", async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: { ImageLink: { S: "123abc" }, UserId: { S: "default" } },
    });
    ddbMock.on(DeleteItemCommand).resolves({});
    s3Mock.onAnyCommand().resolves({});
    const cardId = "abc123";
    const response = await request(app)
      .delete(`/flashcards`)
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123")
      .send({
        cardId: cardId,
        userId: "default",
      });
    assert.deepStrictEqual(response.body, { cardId: cardId });
  });
});

describe("GET /images", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
    mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
    mock.restoreAll();
  });
  test("Allowed word should return sample image", async () => {
    const word = "trouver";
    const langMode = "French";
    const sentence = "Je ne trouve pas mes lunettes.";
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const expectedResult = {
      created: 123,
      data: [
        {
          url: "https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/gavygdwhilk8d2cytkeq",
        },
      ],
    };
    mock.method(openaiMock.images, "generate", () => {
      return expectedResult;
    });
    ddbMock.onAnyCommand().resolves({});
    const response = await request(app)
      .get(
        `/images?sentence=${sentence}&lang_mode=${langMode}&word=${word}&cardId=${cardId}&userId=${userId}&timeStamp=123`,
      )
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.deepStrictEqual(response.body, expectedResult);
  });
  test("Unallowed word should return a error message", async () => {
    const word = "rentrée";
    const langMode = "French";
    const sentence = "Courage, c'est la rentrée!";
    // const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    ddbMock.onAnyCommand().resolves({});
    mock.method(openaiMock.images, "generate", () => {
      return {};
    });
    const response = await request(app)
      .get(
        `/images?sentence=${sentence}&lang_mode=${langMode}&word=${word}&cardId=${cardId}`,
      )
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.deepStrictEqual(response.body, {
      status: 400,
      message: "Unsupported word: rentrée",
    });
  });
});

describe("POST /images", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
    mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
    mock.restoreAll();
  });
  test("image should be uploaded successfully", async () => {
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "C2";
    const imgUrl = "https://picsum.photos/250";
    const imgName = `${cardId}-${languageMode}-${languageLevel}-123`;
    s3Mock.onAnyCommand().resolves({});
    ddbMock.onAnyCommand().resolves({});
    const response = await request(app)
      .post(`/images`)
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123")
      .send({
        imgUrl: imgUrl,
        imgName: imgName,
        userId: "default",
        cardId: cardId,
      });
    assert.deepStrictEqual(response.body, {
      url: `${process.env.CLOUDFRONT_URL}/users/default/images/${imgName}.png`,
    });
  });
});

describe("GET /sentences", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
    mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
    mock.restoreAll();
  });
  test("invalid word should return an empty response", async () => {
    const word = "hello"; // invalid word
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "A1";
    mock.method(openaiMock.chat.completions, "create", () => {
      return {
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
      };
    });
    const response = await request(app)
      .get(
        `/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timeStamp=123`,
      )
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123")
      .send();
    assert.deepStrictEqual(response.body, {
      status: 400,
      message: "Invalid words: hello",
    });
  });
  test("unsupported language should return an empty response", async () => {
    const word = "viikko"; // invalid word
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "Finnish";
    const languageLevel = "YKI1";
    const response = await request(app)
      .get(
        `/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timeStamp=123`,
      )
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.deepStrictEqual(response.body, {
      status: 400,
      message: "Unsupported language: Finnish",
    });
  });
  test("invalid language level should return an empty response", async () => {
    const word = "être";
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "G2";
    const response = await request(app)
      .get(
        `/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timeStamp=123`,
      )
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.deepStrictEqual(response.body, {
      status: 400,
      message: "Invalid language level: G2",
    });
  });
  test("valid input should return JSON stringified response with correct key values", async () => {
    const word = "être";
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "C2";
    const expectedResult = {
      word: `${word}`,
      sampleSentence: `Example sentence using ${word} in ${languageMode}} at level ${languageLevel}`,
      translatedSampleSentence: "English translation of the example sentence",
      wordTranslated: `English translation of ${word}`,
    };
    mock.method(openaiMock.chat.completions, "create", () => {
      return {
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
              content: JSON.stringify(expectedResult),
            },
          },
        ],
      };
    });
    ddbMock.onAnyCommand().resolves({});
    const response = await request(app)
      .get(
        `/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timeStamp=123`,
      )
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer abc123");
    assert.notStrictEqual(response.body, undefined);
    assert.notStrictEqual(response.body.content, "");
    const parsedContent = JSON.parse(response.body.content);
    assert.deepStrictEqual(parsedContent, expectedResult);
  });
});
