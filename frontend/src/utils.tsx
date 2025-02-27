import { AnyAction } from '@reduxjs/toolkit';
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import serviceConfig from '../config/service.json';

const getNewCardText = async (word: string, languageMode: string, languageLevel: string, userId: string, cardId: string, timeStamp: number, accessToken: string) => {
  console.log("start getNewCardText");
  try {
    if (!accessToken) {
      console.log("User not authenticated")
      return {}
    }
    const response = await fetch(
      `${serviceConfig.BACKEND_ENDPOINT}${serviceConfig.BACKEND_PATH}/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timeStamp=${timeStamp}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      },
    );
    if (!(response.ok)) {
      return {}
    }
    console.log("getNewCardText fetch successful")
    const json = await response.json();
    let cardData;
    cardData = json.content; // stringified JSON
    cardData = JSON.parse(cardData);
    cardData.wordTranslated = cardData.wordTranslated.toLowerCase();
    cardData.id = cardId;
    cardData.generatingText = false;
    console.log("end getNewCardText");
    return cardData;
  } catch (e) {
    console.error(e);
    return {}
  }
  
}

const getNewCardImage = async (dispatch: Dispatch<AnyAction>, cardData: FlashCard, languageMode: string, languageLevel: string, userId: string, cardId: string, word: string, accessToken: string) => {
    console.log("start getNewCardImage...");
    try {
      if (!accessToken) {
        console.log("User not authenticated")
        return {}
      }
      cardData.generatingImage = true;
      dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
      const imageResponse = await fetch(
        `${serviceConfig.BACKEND_ENDPOINT}${serviceConfig.BACKEND_PATH}/images?sentence=${cardData.translatedSampleSentence}&lang_mode=${languageMode}&word=${word}&cardId=${cardData.id}&userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
        },
      );
      const imageJson = await imageResponse.json();
      // 3rd fetch to persist the image in s3 then update references with persisted url
      const uploadResponse = await fetch(
        `${serviceConfig.BACKEND_ENDPOINT}${serviceConfig.BACKEND_PATH}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            imgUrl: imageJson.data[0].url,
            imgName: `${cardId}-${languageMode}-${languageLevel}-${Date.now()}`,
            userId: userId,
            cardId: cardId
          }),
        },
      );
      const uploadJson = await uploadResponse.json();
      cardData.img = uploadJson.url;
      cardData.generatingImage = false;
      dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
      console.log("end getNewCardImage...")
      return cardData;
    } catch (e) {
      console.error(e);
      return {}
    }
}

const getNewCardData = async (dispatch: Dispatch<AnyAction>, word: string, languageMode: string, languageLevel: string, userId: string, cardId: string, timeStamp: number, accessToken: string ) => {
  console.log("start getNewCardData")
  let cardData = await getNewCardText(word, languageMode, languageLevel, userId, cardId, timeStamp, accessToken);
  console.log("getNewCardData cardData", cardData);
  if (typeof(cardData.sampleSentence) == 'undefined') {
    return {}
  }
    console.log("getNewCardText values", cardData)
    dispatch({
    type: "update-card",
    cardId: cardId,
    cardData: cardData,
    });
  cardData = await getNewCardImage(dispatch, cardData, languageMode, languageLevel, userId, cardId, word, accessToken);
    console.log("Final state of getNewCardData", cardData)
    dispatch({
    type: "update-card",
    cardId: cardId,
    cardData: cardData,
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
  accessToken: string
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
        const cardData = await getNewCardData(dispatch, word, languageMode, languageLevel, userId,cardId, timeStamp, accessToken);
        console.log("generateNewCard cardData", cardData)
        
        if (typeof(cardData.sampleSentence) == 'undefined') {
          dispatch({
            type: "delete-card",
            cardId: cardId,
          });
          setErrors((curr) => [...curr, {id: uuidv4(), message: "Failed to generate card"}])
        }
      }
    } catch (e: any) {
      // Delete newly created card if there is an error
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error("The second error is:", e);
    }
};

// Update an existing card with a new generation
export const generateNextCard = async (
  dispatch: Dispatch<AnyAction>,
  word: string,
  languageMode: string,
  languageLevel: string,
  cardData: FlashCard,
  setErrors: Dispatch<SetStateAction<Array<ErrorMessage>>>,
  userId: string,
  accessToken: string,
) => {
    const cardId = cardData.id;
    const timeStamp = Date.now();
    try {
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: true });
      const cardData = await getNewCardData(dispatch, word, languageMode, languageLevel, userId, cardId, timeStamp, accessToken)
      // delete card if sample sentence was not successfully generated
      if (typeof(cardData.sampleSentence) == 'undefined') {
        dispatch({
          type: "delete-card",
          cardId: cardId,
        });
        setErrors((curr) => [...curr, {id: uuidv4(), message: "Failed to regenerate card"}])
      }
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: false });
    } catch (e: any) {
      // Signal that no longer generating text on error
      dispatch({ type: "set-generating-text", cardId: cardId, isGenerating: false  });
      const errItem = { id: uuidv4(), message: e.message };
      setErrors((errs) => [...errs, errItem]);
      console.error(e);
    }
};
