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
        let cardData = json.choices[0].message.content; // stringified JSON
        try {
          cardData = JSON.parse(cardData);
        } catch (e) {
          dispatch({ type: "delete-card", cardId: cardId });
          console.error(e);
        }
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
      // Delete newly created card if there is an error
      console.error(e);
    }
  } else {
    const cardId = cardData.id;
    try {
      dispatch({ type: "toggle-generating-text", cardId: cardId });
      const textGenUrl = `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`;
      console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`);
      const response = await fetch(textGenUrl);
      const json = await response.json();
      const content = json.choices[0].message.content;

      try {
        cardData = JSON.parse(cardData);
      } catch (e) {
        // Signal that no longer generating text on error
        dispatch({ type: "toggle-generating-text", cardId: cardId });
        // TODO: Let user know that the text wasn't regenerated correctly
        console.error(e);
      }
      const generatedCardData = JSON.parse(content);
      let newCardData = {
        id: cardId,
        word: word,
        sampleSentence: generatedCardData.sampleSentence,
        translatedSampleSentence: generatedCardData.translatedSampleSentence,
        wordTranslated: generatedCardData.wordTranslated,
        generatingText: false,
        generatingImage: true,
      };
      dispatch({
        type: "update-card",
        cardId: cardId,
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
        cardId: cardId,
        cardData: newCardData,
      });
      //   console.log(`FlashCard.js - allCardData: ${JSON.stringify(cards)}`);
    } catch (e) {
      // Signal that no longer generating text on error
      dispatch({ type: "toggle-generating-text", cardId: cardId });
      console.error(e);
    }
  }
};

export default generateCard;
