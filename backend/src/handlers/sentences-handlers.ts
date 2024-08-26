import { dynamoDb, s3 } from '../classes/aws';
import { GenAIClient } from "../classes/abstract";
import { GenericServerResponse } from '../../types/global';
import appConfig from "../config";
import { ChatCompletion } from 'openai/resources/index.mjs';

const constructPrompt = (targetLevel: string, targetLanguage: string, wordToSearch: string) => {
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
  return `Please create 1 example sentence under 100 words in length showing how the word ${wordToSearch} is commonly used in ${targetLanguage}. Use${
      cert === " " ? "" : cert
    } ${targetLevel} vocabulary and grammar points. Return the sentence in the following JSON format {"word": "${wordToSearch}","sampleSentence": "Example sentence using ${wordToSearch}","translatedSampleSentence":"English translation of the example sentence","wordTranslated": "English translation of ${wordToSearch}"}.`
}

interface handleGetSentenceInput {
  wordsToSearch: string | string[];
  targetLanguage: string;
  targetLevel: string;
  userId: string;
  cardId: string;
  timeStamp: string;
}
export const handleGetSentence =  async (input: handleGetSentenceInput, dynamoDbClient: dynamoDb, openaiClient: GenAIClient): Promise<GenericServerResponse> => {
  try {
    const wordsToSearch = input.wordsToSearch;
    const targetLanguage = input.targetLanguage;
    let targetLevel = input.targetLanguage;
    const userId = input.userId;
    const cardId = input.cardId;
    const timeStamp = input.timeStamp;
    let prompts = [] 
    let prompt = ""
    for (let wordToSearch of wordsToSearch) {
      prompt = constructPrompt(targetLevel,targetLanguage,wordToSearch);
      prompts.push(prompt)
    }
    const response: ChatCompletion = await openaiClient.generateText(prompts);
    if (response) {
      await dynamoDbClient.putItem({
        Item: {
          UserId: { S: userId },
          TimeStamp: { S: new String(timeStamp).toString() },
          FlashCardId: { S: cardId },
          TextCompletionCreated: { N: new String(response.created).toString() },
          TextPrompt: { S: JSON.stringify(prompts) },
          TextModel: { S: "gpt-3.5-turbo" },
          Content: { S: response.choices[0].message.content },
          FinishReason: { S: response.choices[0].finish_reason },
          PromptTokens: { N: new String(response.usage.prompt_tokens).toString() },
          CompletionTokens: { N: new String(response.usage.completion_tokens).toString() },
          TotalTokens: { N: new String(response.usage.total_tokens).toString() },
        },
        TableName: "FlashCardGenAITable",
      })
      return {status: 200, body: {content: response}};
    }
  } catch (err) {
    console.error(err);
    return {status: 500, body: {error: err}}
  }
}