import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const PORT = 8000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/openai/test/text", async (req, res) => {
  try {
    const wordsToSearch = Array.isArray(req.query.word)
      ? req.query.word
      : [req.query.word];
    console.log(wordsToSearch)
    const wordToSearch = wordsToSearch
    const targetLanguage = req.query.lang_mode;
    let targetLevel = req.query.lang_level;
    const userId = req.body.userId;
    const cardId = req.body.cardId;
    const timeStamp = req.body.timeStamp;
    console.log("userid", userId, "cardid", cardId, "timeStamp", timeStamp);
    const response = {choices:[{ message: {content: JSON.stringify({word: `${wordToSearch}`,sampleSentence: `Example sentence using ${wordToSearch} in ${targetLanguage} at level ${targetLevel}`,translatedSampleSentence:"English translation of the example sentence",wordTranslated: `English translation of ${wordToSearch}`})}}]}
    console.log(response)
    res.send(response)
  } catch (err) {
    console.error(err);
  }
});

app.post("/openai/test/imagine", async (req, res) => {
  try {
    const sentenceToVisualize = req.query.sentence;
    console.log("visualizing...", sentenceToVisualize);
    const response = {
      created: Date.now(),
      data: [
        {
          url: "https://picsum.photos/256.jpg"
        }
      ]
    }
    res.send(response);
  } catch (e) {
    console.error(e);
    res.send({
      created: 400,
      data: [
        {
          url: "https://m.media-amazon.com/images/I/418Jmnejj8L.jpg",
        },
      ],
    });
  }
});

app.post("/flashcards", async (req, res) => {
});

app.listen(PORT, () => console.log("server is running on port " + PORT));
