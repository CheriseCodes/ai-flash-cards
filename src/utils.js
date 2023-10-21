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

const regenerateCard = async (
  dispatch,
  setRegenerateCardSpinner,
  currWord,
  languageMode,
  languageLevel,
  cardData,
) => {
  try {
    setRegenerateCardSpinner(true);
    const textGenUrl = `http://localhost:8000/openai/test/text?word=${currWord}&lang_mode=${languageMode}&lang_level=${languageLevel}`;

    console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`);
    const response = await fetch(textGenUrl);
    const json = await response.json();
    const generatedCardData = JSON.parse(json.choices[0].message.content);
    const imageGenUrl = `http://localhost:8000/openai/test/imagine?sentence=${generatedCardData.translatedSampleSentence}`;
    const imageResponse = await fetch(imageGenUrl);
    const imageJson = await imageResponse.json();
    console.log(
      `newCardData JSON - ${generatedCardData.sampleSentence}, ${generatedCardData.translatedSampleSentence}`,
    );
    const newCardData = {
      id: cardData.id,
      word: currWord,
      img: imageJson.data[0].url,
      sampleSentence: generatedCardData.sampleSentence,
      translatedSampleSentence: generatedCardData.translatedSampleSentence,
      wordTranslated: generatedCardData.wordTranslated,
    };
    console.log(`FlashCard.js - newCardData : ${JSON.stringify(newCardData)}`);
    dispatch({
      type: "update-card",
      cardId: cardData.id,
      cardData: newCardData,
    });
    //   console.log(`FlashCard.js - allCardData: ${JSON.stringify(cards)}`);
    setRegenerateCardSpinner(false);
  } catch (e) {
    console.error(e);
  }
};
export { regenerateCard };
export default generateCard;
