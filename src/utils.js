import { v4 as uuidv4 } from "uuid";

const generateCard = async (
  dispatch,
  setSpinner,
  isNewCard,
  word,
  languageMode,
  languageLevel,
  cardData,
  setErrors,
  userId,
) => {
  console.log(`App.generateCard - word: ${word}`);
  if (isNewCard) {
    try {
      if (word) {
        setSpinner(true);
        // add empty card with id
        const cardId = uuidv4();
        const timeStamp = Date.now();
        dispatch({
          type: "add-card",
          cardData: {
            id: cardId,
            generatingText: true,
            generatingImage: false,
          },
        });
        let cardData;
        try {
          const response = await fetch(
            `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
                cardId: cardId,
                timeStamp: timeStamp,
              }),
            },
          );
          console.log("Sent request data, received:", JSON.stringify(response));
          const json = await response.json();
          console.log("Received data");
          cardData = json.choices[0].message.content; // stringified JSON
          cardData = JSON.parse(cardData);
          cardData.wordTranslated = cardData.wordTranslated.toLowerCase();
          cardData.id = cardId;
          cardData.generatingText = false;
          cardData.generatingImage = true;
          dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
          const imageResponse = await fetch(
            `http://localhost:8000/openai/test/imagine?sentence=${cardData.translatedSampleSentence}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userId,
                cardId: cardId,
              }),
              mode: 'cors',
              cache: 'no-store'
            },
          );
          const imageJson = await imageResponse.json();
          cardData.img = imageJson.data[0].url;
          cardData.generatingImage = false;
          console.log(
            `App.generateCard - cardData: ${JSON.stringify(cardData)}`,
          );
          dispatch({
            type: "update-card",
            cardData: cardData,
            cardId: cardId,
          });
          // TODO: 3rd fetch to persist the image in s3 and update references with persisted url
          const uploadResponse = await fetch(
            `http://localhost:8000/upload/image`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                imgUrl: cardData.img,
                imgName: `${cardId}-${word}-${languageMode}-${languageLevel}-${Date.now()}`
              }),
            },
          );
          console.log("uploadResponse", uploadResponse);
          const uploadJson = await uploadResponse.json();
          cardData.img = uploadJson.url;
          dispatch({
            type: "update-card",
            cardData: cardData,
            cardId: cardId,
          });
        } catch (e) {
          dispatch({ type: "delete-card", cardId: cardId });
          const errItem = { id: uuidv4(), message: e.message };
          setErrors((errs) => [...errs, errItem]);
          console.error("The first error is:", errItem);
        }
        setSpinner(false);
        //   console.log(`App.generateCard - allCardData: ${cards}`);
      }
    } catch (e) {
      // Delete newly created card if there is an error
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error("The second error is:", e);
    }
  } else {
    const cardId = cardData.id;
    const timeStamp = Date.now();
    try {
      dispatch({ type: "toggle-generating-text", cardId: cardId });
      const textGenUrl = `http://localhost:8000/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`;
      console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`);
      let content;
      try {
        const response = await fetch(textGenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            cardId: cardId,
            timeStamp: timeStamp,
          }),
        });
        console.log(response);
        const json = await response.json();
        console.log(json);
        content = json.choices[0].message.content;
        console.log(cardData);
        // cardData = JSON.parse(cardData);
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
        const imageResponse = await fetch(imageGenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            cardId: cardId,
          }),
        });
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
      } catch (e) {
        // Signal that no longer generating text on error
        dispatch({ type: "toggle-generating-text", cardId: cardId });
        const errItem = { id: uuidv4(), message: e.message };
        setErrors((errs) => [...errs, errItem]);
        console.error(e);
      }
    } catch (e) {
      // Signal that no longer generating text on error
      dispatch({ type: "toggle-generating-text", cardId: cardId });
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error(e);
    }
  }
};

export default generateCard;
