import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import https from "https";
import { open, rm } from "node:fs/promises";

const PORT = 8000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// NOTE: Internet must still be on to load resources from the internet
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
          url: "https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/gavygdwhilk8d2cytkeq"
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
  res.send({data: []})
});

app.post("/upload/image", async (req, res) => {
  try {
    // Download image
    const imgUrl = req.body.imgUrl;
    const localFileName = "./private/images/download.png";
    console.log(imgUrl);

    https.get(imgUrl, async (res) => {
      const fdWrite = await open(localFileName, "w");
      const writeStream = res.pipe(fdWrite.createWriteStream());
      writeStream.on("finish", async () => {
        // Read content of downloaded file
        const fdRead = await open(localFileName);
        // Create a stream from some character device.
        const stream = fdRead.createReadStream();
        stream.on("close", () => {
          rm(localFileName);
        });
        stream.close();
      });
    });
    const signedUrl = imgUrl
    res.send({ url: signedUrl });
  } catch (e) {
    res.send(e);
    console.error(e);
  }
});

app.listen(PORT, () => console.log("server is running on port " + PORT));
