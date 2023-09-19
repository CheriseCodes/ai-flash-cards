import express from 'express';
import axios from "axios";
import OpenAI from 'openai';
import cors from 'cors';

const PORT = 8000;
const app = express();
app.use(cors())

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  app.get('/openai/test/text', async (req, res) => {
    try {
        const wordToSearch = req.query.word;
        const targetLanguage = req.query.lang_mode;
        const targetLevel = req.query.level_level
        console.log(wordToSearch);
        const messages = [{'role': 'user', 'content': `Please create 1 example sentence under 15 words long showing how the word ${wordToSearch} is commonly used in ${targetLanguage}. Use up to ${targetLevel} vocabulary or grammar points (inclusive). Return the sentence in the following JSON format {"word": "${wordToSearch}","or": "Example sentence using the value of 'word'","tr":"English translation of example sentence"}.`}]
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages
          })
        if (response?.id) {
            console.log(response.choices[0].message.content)
            // res.send(response.choices[0].message.content)
            res.send(response)
        }
    } catch (e) {
        console.error(e)
    }
})


// TODO: Automate creating mock API responses
app.get('/openai/test/imagine', async (req, res) => {
    try {
        const sentenceToVisualize = req.query.sentence;
        // TODO: Try add more American illustrators - https://www.christies.com/en/stories/that-s-america-a-collector-s-guide-to-american-il-a870d242cd3a4c6784cd603427d4d83a
        const response = await openai.images.generate({
            prompt: `"${sentenceToVisualize}" visualized, Norman Rockwell illustration style, Claude Monet painting style, vibrant colors, realistic, detailed, without words, without text, without writing`,
            n: 1,
            size: "256x256",
          });
        console.log(response)
        if (response?.created) {
            res.send(response)
        }
    } catch (e) {
        console.error(e)
    }
})

app.get('/openai-test', async (req, res) => {
    try {
        const wordToSearch = req.query.word;
        const mockJson = {id: wordToSearch ,object:"chat.completion",created:1690999999,model:"gpt-3.5-turbo-0613",choices:[{index:0,message:{role:"assistant",content:"{\"word\": \"먹다\",\"kr\": \"오늘 저녁에 친구랑 먹다가 영화를 볼 계획이에요.\",\"en\": \"I plan to eat with my friend tonight and watch a movie.\"}"},finish_reason:"stop"}],usage:{prompt_tokens:77,completion_tokens:61,total_tokens:138}}
        res.json(mockJson)
    } catch (e) {
        console.error(e)
    }
})

app.listen(PORT, () => console.log('server is running on port '+PORT));