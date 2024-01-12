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
import { openai, app } from "../src/server";
import { dynamoDbClient, s3Client } from "../src/aws-clients";
import {
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { authenticateToken, authorizeToken } from "../src/auth-helpers";

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
    mock.fn(authenticateToken, (req) => {return 200; });
    mock.fn(authorizeToken, (req) => {return "default";});
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
    mock.fn(authenticateToken, () => {return 200});
    mock.fn(authorizeToken, () => {return "default"});
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

describe("DELETE /flashcard", () => {
  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
  });
  afterEach(() => {
    ddbMock.restore();
    s3Mock.restore();
  });
  test("existing flashcard is deleted", async () => {
    mock.fn(authenticateToken, () => {return 200});
    mock.fn(authorizeToken, () => {return "default"});
    ddbMock.on(GetItemCommand).resolves({Item: {ImageLink: {S: "123abc"}, UserId: {S: "default"}}});
    ddbMock.on(DeleteItemCommand).resolves({});
    s3Mock.onAnyCommand().resolves({});
    const cardId = "abc123";
    const response = await fetch(`http://localhost:${PORT}/flashcard`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer abc123",
      },
      body: JSON.stringify({
        cardId: cardId,
      }),
    });
    const json = await response.json();
    assert.deepStrictEqual(json, { cardId: cardId });
  });
});

describe("GET /generations/images", () => {
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
    mock.fn(authenticateToken, () => {return 200})
    mock.fn(authorizeToken, () => {return "default"});
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
      `http://localhost:${PORT}/generations/images?sentence=${sentence}&lang_mode=${langMode}&word=${word}&cardId=${cardId}&userId=${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer abc123",
        },
      },
    );
    const json = await response.json();
    assert.deepStrictEqual(json, expectedResult);
  });
  test("Unallowed word should return a error image", async () => {
    mock.fn(authenticateToken, () => {return 200})
    mock.fn(authorizeToken, () => {return "default"});
    const word = "rentrée";
    const langMode = "French";
    const sentence = "Courage, c'est la rentrée!";
    // const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    ddbMock.onAnyCommand().resolves({});
    mock.method(openai.images, "generate", () => {
      return {};
    });
    const response = await fetch(
      `http://localhost:${PORT}/generations/images?sentence=${sentence}&lang_mode=${langMode}&word=${word}&cardId=${cardId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer abc123",
        },
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
    mock.fn(authenticateToken, () => {return 200});
    mock.fn(authorizeToken, () => {return "default"; });
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "C2";
    const imgUrl =
      "https://www.usatoday.com/gcdn/presto/2022/05/25/USAT/719946ca-660e-4ebf-805a-2c3b7d221a85-Hero-3.jpg";
    const imgName = `${cardId}-${languageMode}-${languageLevel}-123`;
    s3Mock.onAnyCommand().resolves({});
    const response = await fetch(`http://localhost:${PORT}/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer abc123",
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

describe("POST /generations/sentences", () => {
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
    mock.fn(authenticateToken, () => {return 200})
    mock.fn(authorizeToken, () => {return "default"});
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
      `http://localhost:${PORT}/generations/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timestamp=${timeStamp}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer abc123",
        },
      },
    );
    const json = await response.json();
    assert.deepStrictEqual(json, {
      status: 400,
      message: "Invalid words: hello",
    });
  });
  test("unsupported language should return an empty response", async () => {
    mock.fn(authenticateToken, () => {return 200});
    mock.fn(authorizeToken, () => {return "default"});
    const word = "viikko"; // invalid word
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "Finnish";
    const languageLevel = "YKI1";
    const timeStamp = Date.now();
    const response = await fetch(
      `http://localhost:${PORT}/generations/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timestamp=${timeStamp}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer abc123",
        },
      },
    );
    const json = await response.json();
    assert.deepStrictEqual(json, {
      status: 400,
      message: "Unsupported language: Finnish",
    });
  });
  test("invalid language level should return an empty response", async () => {
    mock.fn(authenticateToken, () => {return 200});
    mock.fn(authorizeToken, () => {return "default"});
    const word = "être";
    const userId = "default";
    const cardId = "93960a65-ce5e-4d4d-ba2a-8d9e8eeb57d9";
    const languageMode = "French";
    const languageLevel = "G2";
    const timeStamp = Date.now();
    const response = await fetch(
      `http://localhost:${PORT}/generations/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timestamp=${timeStamp}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer abc123",
        },
      },
    );
    const json = await response.json();
    assert.deepStrictEqual(json, {
      status: 400,
      message: "Invalid language level: G2",
    });
  });
  test("valid input should return JSON stringified response with correct key values", async () => {
    mock.fn(authenticateToken, () => {return 200});
    mock.fn(authorizeToken, () => {return "default"});
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
      `http://localhost:${PORT}/generations/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timestamp=${timeStamp}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer abc123",
        },
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
