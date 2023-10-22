import express from "express";
//import axios from "axios";
import OpenAI from "openai";
import cors from "cors";

import appConfig from "./src/config.js";

const PORT = 8000;
const app = express();
app.use(cors());

// TODO: Store generated responses in a database
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/openai/test/text", async (req, res) => {
  try {
    const wordsToSearch = Array.isArray(req.query.word)
      ? req.query.word
      : [req.query.word];
    const targetLanguage = req.query.lang_mode;
    let targetLevel = req.query.lang_level;
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
      targetLevel = `${targetLevel.slice(0, -1)} ${targetLevel.slice(-1)}`
      if (["1","2"].includes(targetLevel.slice(-1))) {
        cert = cert.concat("TOPIK I")
      } else {
        cert = cert.concat("TOPIK II")
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
    if (response?.id) {
      console.log(response.choices[0].message.content);
      // res.send(response.choices[0].message.content)
      res.send(response);
    }
  } catch (err) {
    console.error(err);
  }
});

// TODO: Automate creating mock API responses
// TODO: Store images in database because can't access them without being signed into OpenAI
app.get("/openai/test/imagine", async (req, res) => {
  try {
    const sentenceToVisualize = req.query.sentence;
    console.log("visualizing...", sentenceToVisualize);
    // TODO: Try add more American illustrators - https://www.christies.com/en/stories/that-s-america-a-collector-s-guide-to-american-il-a870d242cd3a4c6784cd603427d4d83a
    const response = await openai.images.generate({
      prompt: `${sentenceToVisualize}, Norman Rockwell illustration style, Claude Monet painting style, vibrant colors, realistic, London, Toronto, Melbourne, Cape Town, Shanghai`,
      n: 1,
      size: "256x256",
    });
    console.log(response);
    if (response?.created) {
      res.send(response);
    }
  } catch (e) {
    console.error(e);
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

app.listen(PORT, () => console.log("server is running on port " + PORT));
