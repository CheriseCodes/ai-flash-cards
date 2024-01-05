import {
  describe,
  test,
  beforeEach,
  afterEach,
  mock,
  before,
  after,
} from "node:test";
import assert from "node:assert";
import { mockClient } from "aws-sdk-client-mock";
import { dynamoDbClient, s3Client, openai, app } from "../src/server";
import {
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { authenticateToken } from "../src/auth-helpers";

const PORT = 8000;

const ddbMock = mockClient(dynamoDbClient);
const s3Mock = mockClient(s3Client);
let server;
describe("GET /flashcards", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
  });
  before(() => {
    server = app.listen(PORT, () =>
      console.log("server is running on port " + PORT),
    ); // IMPORTANT: First test should start the server
  });
  test("existent user should have non-empty cards response", async () => {
    mock.fn(authenticateToken, () => {return 200})
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
    const response = await fetch(`http://localhost:${PORT}/flashcards?userId=${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer abc123"
      },
    });
    const json = await response.json();
    assert.deepStrictEqual(json, { cards: queryResult.Items });
  });
  test("non-existent user should have non-empty cards response", async () => {
    mock.fn(authenticateToken, () => {return 200})
    const queryResult = {
      Items: [],
    };
    ddbMock.onAnyCommand().resolves(queryResult);
    s3Mock.onAnyCommand().resolves({});
    const userId = "default";
    const response = await fetch(`http://localhost:${PORT}/flashcards?userId=${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer abc123"
      }
    });
    const json = await response.json();
    assert.deepStrictEqual(json, { cards: queryResult.Items });
  });
});

describe("POST /delete/flashcard", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
  });
  test("existing flashcard is deleted", async () => {
    ddbMock.on(GetItemCommand).resolves({Item: {ImageLink: {S: "123abc"}}});
    ddbMock.on(DeleteItemCommand).resolves({});
    s3Mock.onAnyCommand().resolves({});
    const cardId = "abc123";
    const response = await fetch(`http://localhost:${PORT}/delete/flashcard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId: cardId,
      }),
    });
    const json = await response.json();
    assert.deepStrictEqual(json, { cardId: cardId });
  });
});

describe("POST /openai/test/imagine", () => {
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
  test("Allowed word should return a valid image", async () => {
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
    mock.method(openai.images, "generate", () => {
      return expectedResult;
    });
    ddbMock.onAnyCommand().resolves({});
    const response = await fetch(
      `http://localhost:${PORT}/openai/test/imagine?sentence=${sentence}&lang_mode=${langMode}&word=${word}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          cardId: cardId,
        }),
      },
    );
    const json = await response.json();
    assert.deepStrictEqual(json, expectedResult);
  });
  test("Unallowed word should return a error image", async () => {
    const word = "rentrée";
    const langMode = "French";
    const sentence = "Courage, c'est la rentrée!";
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    ddbMock.onAnyCommand().resolves({});
    mock.method(openai.images, "generate", () => {
      return {};
    });
    const response = await fetch(
      `http://localhost:${PORT}/openai/test/imagine?sentence=${sentence}&lang_mode=${langMode}&word=${word}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          cardId: cardId,
        }),
      },
    );
    const json = await response.json();
    assert.deepStrictEqual(json, {
      status: 400,
      message: "Unsupported word: rentrée",
    });
  });
});

describe("POST /upload/image", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
  });
  test("image should be uploaded successfully", async () => {
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "C2";
    const imgUrl =
      "https://www.usatoday.com/gcdn/presto/2022/05/25/USAT/719946ca-660e-4ebf-805a-2c3b7d221a85-Hero-3.jpg";
    const imgName = `${cardId}-${languageMode}-${languageLevel}-123`;
    s3Mock.onAnyCommand().resolves({});
    const response = await fetch(`http://localhost:${PORT}/upload/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imgUrl: imgUrl,
        imgName: imgName,
      }),
    });
    const json = await response.json();
    assert.deepStrictEqual(json, {
      url: `${process.env.CLOUDFRONT_URL}/users/default/images/${imgName}.png`,
    });
  });
});

describe("POST /openai/test/text", () => {
  after(() => {
    server.close(); // IMPORTANT: Last test should close the server
  });
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
    const timeStamp = Date.now();
    mock.method(openai.chat.completions, "create", () => {
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
    const json = await response.json();
    assert.deepStrictEqual(json, {
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
    const timeStamp = Date.now();
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
    const json = await response.json();
    assert.deepStrictEqual(json, {
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
    const timeStamp = Date.now();
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
    const json = await response.json();
    assert.deepStrictEqual(json, {
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
    const timeStamp = Date.now();
    const expectedResult = {
      word: `${word}`,
      sampleSentence: `Example sentence using ${word} in ${languageMode}} at level ${languageLevel}`,
      translatedSampleSentence: "English translation of the example sentence",
      wordTranslated: `English translation of ${word}`,
    };
    mock.method(openai.chat.completions, "create", () => {
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
    ).catch((err) => {
      return new Response(new Blob(), {
        status: err.status,
        statusText: err.message,
      });
    });
    const json = await response.json().catch((err) => {
      return { error: err.error };
    });
    assert.notStrictEqual(json.content, "");
    const parsedContent = JSON.parse(json.content);
    assert.deepStrictEqual(parsedContent, expectedResult);
  });
});
