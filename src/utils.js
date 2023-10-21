import { v4 as uuidv4 } from "uuid";

const generateCard = async (
  dispatch,
  setSpinner,
  word,
  languageMode,
  languageLevel,
) => {
  console.log(`App.generateCard - word: ${word}`);
  try {
    if (word) {
      setSpinner(true);
      const response = await fetch(
        `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
      );
      const json = await response.json();

      console.log(`generateCardImage response:${JSON.stringify(json)}`);
      console.log(`generateCards response:${JSON.stringify(json)}`);
      let cardData = json.choices[0].message.content; // stringified JSON
      cardData = JSON.parse(cardData);
      cardData.wordTranslated = cardData.wordTranslated.toLowerCase();
      cardData.id = uuidv4();
      dispatch({ type: "add-card", cardData: cardData });
      const imageResponse = await fetch(
        `http://localhost:8000/openai/test/imagine?sentence=${cardData.translatedSampleSentence}`,
      );
      const imageJson = await imageResponse.json();
      cardData.img = imageJson.data[0].url;
      console.log(`App.generateCard - cardData: ${JSON.stringify(cardData)}`);
      dispatch({
        type: "update-card",
        cardData: cardData,
        cardId: cardData.id,
      });
      setSpinner(false);
      //   console.log(`App.generateCard - allCardData: ${cards}`);
    }
  } catch (e) {
    console.error(e);
  }
};

export default generateCard;
