import { AnyAction } from "@reduxjs/toolkit";
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";

// TODO: Stop updating card data object directly... only update with update-card reducer
const PORT = (process.env.NODE_ENV == "development") ? 3000 : 8000

const getNewCardText = async (word: string, languageMode: string, languageLevel: string, userId: string, cardId: string, timeStamp: number) => {
  console.log("start getNewCardText");
  const response = await fetch(
    `http://localhost:${PORT}/openai/test/text?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}`,
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

const getNewCardImage = async (dispatch: Dispatch<AnyAction>, cardData: FlashCard, languageMode: string, languageLevel: string, userId: string, cardId: string) => {
    console.log("start getNewCardImage...")
    cardData.generatingImage = true;
    dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
    const imageResponse = await fetch(
      `http://localhost:${PORT}/openai/test/imagine?sentence=${cardData.translatedSampleSentence}`,
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
      `http://localhost:${PORT}/upload/image`,
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

const getNewCardData = async (dispatch: Dispatch<AnyAction>, word: string, languageMode: string, languageLevel: string, userId: string, cardId: string, timeStamp: number) => {
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
  dispatch: Dispatch<AnyAction>,
  word: string,
  languageMode: string,
  languageLevel: string,
  setErrors: Dispatch<SetStateAction<Array<ErrorMessage>>>,
  userId: string,
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
    } catch (e: any) {
      // Delete newly created card if there is an error
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error("The second error is:", e);
    }
};


export const generateNextCard = async (
  dispatch: Dispatch<AnyAction>,
  word: string,
  languageMode: string,
  languageLevel: string,
  cardData: FlashCard, // TODO: swap to cardId cause that's all that's used
  setErrors: Dispatch<SetStateAction<Array<ErrorMessage>>>,
  userId: string,
) => {
    const cardId = cardData.id;
    const timeStamp = Date.now();
    try {
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: true });
      await getNewCardData(dispatch, word, languageMode, languageLevel, userId, cardId, timeStamp)
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: false });
    } catch (e: any) {
      // Signal that no longer generating text on error
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: false  });
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error(e);
    }
};
