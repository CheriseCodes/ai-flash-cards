import { v4 as uuidv4 } from "uuid";

const generateCard = async (
  dispatch,
  setSpinner,
  isNewCard,
  word,
  languageMode,
  languageLevel,
  cardData,
) => {
  console.log(`App.generateCard - word: ${word}`);
  if (isNewCard) {
    try {
      if (word) {
        setSpinner(true);
        // add empty card with id
        const cardId = uuidv4();
        dispatch({
          type: "add-card",
          cardData: {
            id: cardId,
            generatingText: true,
            generatingImage: false,
          },
        });
        const response = await fetch(
          `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
        );
        const json = await response.json();
        console.log(`generateCardImage response:${JSON.stringify(json)}`);
        console.log(`generateCards response:${JSON.stringify(json)}`);
        let cardData = json.choices[0].message.content; // stringified JSON
        cardData = JSON.parse(cardData);
        cardData.wordTranslated = cardData.wordTranslated.toLowerCase();
        cardData.id = cardId;
        cardData.generatingText = false;
        cardData.generatingImage = true;
        dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
        const imageResponse = await fetch(
          `http://localhost:8000/openai/test/imagine?sentence=${cardData.translatedSampleSentence}`,
        );
        const imageJson = await imageResponse.json();
        cardData.img = imageJson.data[0].url;
        cardData.generatingImage = false;
        console.log(`App.generateCard - cardData: ${JSON.stringify(cardData)}`);
        dispatch({
          type: "update-card",
          cardData: cardData,
          cardId: cardId,
        });
        setSpinner(false);
        //   console.log(`App.generateCard - allCardData: ${cards}`);
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      const cardId = cardData.id;
      dispatch({ type: "toggle-generating-text", cardId: cardId });
      const textGenUrl = `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`;
      console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`);
      const response = await fetch(textGenUrl);
      const json = await response.json();
      const generatedCardData = JSON.parse(json.choices[0].message.content);
      let newCardData = {
        id: cardData.id,
        word: word,
        sampleSentence: generatedCardData.sampleSentence,
        translatedSampleSentence: generatedCardData.translatedSampleSentence,
        wordTranslated: generatedCardData.wordTranslated,
        generatingText: false,
        generatingImage: true,
      };
      dispatch({
        type: "update-card",
        cardId: cardData.id,
        cardData: newCardData,
      });
      const imageGenUrl = `http://localhost:8000/openai/test/imagine?sentence=${generatedCardData.translatedSampleSentence}`;
      const imageResponse = await fetch(imageGenUrl);
      const imageJson = await imageResponse.json();
      console.log(
        `newCardData JSON - ${generatedCardData.sampleSentence}, ${generatedCardData.translatedSampleSentence}`,
      );
      newCardData.img = imageJson.data[0].url;
      newCardData.generatingImage = false;
      console.log(
        `FlashCard.js - newCardData : ${JSON.stringify(newCardData)}`,
      );
      dispatch({
        type: "update-card",
        cardId: cardData.id,
        cardData: newCardData,
      });
      //   console.log(`FlashCard.js - allCardData: ${JSON.stringify(cards)}`);
    } catch (e) {
      console.error(e);
    }
  }
};

export default generateCard;
