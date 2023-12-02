import { v4 as uuidv4 } from "uuid";

// TODO: Stop updating card data object directly... only update with update-card reducer

const getNewCardText = async (word, languageMode, languageLevel, userId, cardId, timeStamp) => {
  console.log("start getNewCardText");
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
  const json = await response.json();
  let cardData;
  cardData = json.choices[0].message.content; // stringified JSON
  cardData = JSON.parse(cardData);
  cardData.wordTranslated = cardData.wordTranslated.toLowerCase();
  cardData.id = cardId;
  cardData.generatingText = false;
  console.log("end getNewCardText");
  return cardData;
}

const getNewCardImage = async (dispatch, cardData, languageMode, languageLevel, userId, cardId) => {
    console.log("start getNewCardImage...")
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
      },
    );
    const imageJson = await imageResponse.json();
    // 3rd fetch to persist the image in s3 then update references with persisted url
    const uploadResponse = await fetch(
      `http://localhost:8000/upload/image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imgUrl: imageJson.data[0].url,
          imgName: `${cardId}-${languageMode}-${languageLevel}-${Date.now()}`,
        }),
      },
    );
    const uploadJson = await uploadResponse.json();
    cardData.img = uploadJson.url;
    cardData.generatingImage = false;
    dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
    console.log("end getNewCardImage...")
    return cardData;
}

const getNewCardData = async (dispatch, word, languageMode, languageLevel, userId, cardId, timeStamp) => {
  console.log("start getNewCardData")
  let cardData = await getNewCardText(word, languageMode, languageLevel, userId, cardId, timeStamp);
  let promise1 = Promise.resolve(cardData);
  
  promise1.then((values) => {
    dispatch({
    type: "update-card",
    cardId: cardId,
    cardData: values,
  });
})
  
  cardData = await getNewCardImage(dispatch, cardData, languageMode, languageLevel, userId, cardId);
  promise1 = Promise.resolve(cardData);
  
  promise1.then((values) => {
    dispatch({
    type: "update-card",
    cardId: cardId,
    cardData: values,
  });
})
  console.log("end getNewCardData")
  return cardData;
}

export const generateNewCard = async (
  dispatch,
  word,
  languageMode,
  languageLevel,
  setErrors,
  userId,
) => {
    try {
      if (word) {
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
        getNewCardData(dispatch, word, languageMode, languageLevel, userId,cardId, timeStamp);
      }
    } catch (e) {
      // Delete newly created card if there is an error
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error("The second error is:", e);
    }
};


export const generateNextCard = async (
  dispatch,
  word,
  languageMode,
  languageLevel,
  cardData, // TODO: swap to cardId cause that's all that's used
  setErrors,
  userId,
) => {
    const cardId = cardData.id;
    const timeStamp = Date.now();
    try {
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: true });
      await getNewCardData(dispatch, word, languageMode, languageLevel, userId, cardId, timeStamp)
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: false });
    } catch (e) {
      // Signal that no longer generating text on error
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: false  });
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error(e);
    }
};
