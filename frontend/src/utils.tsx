import { AnyAction } from "@reduxjs/toolkit";
import { deepStrictEqual } from "assert";
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";

// TODO: Stop updating card data object directly... only update with update-card reducer
const PORT = process.env.VITE_BACKEND_PORT;
const BACKEND_DOMAIN = process.env.VITE_BACKEND_HOST;
const SECURE_TRANSPORT = (PORT == "443") ? "s" : ""; 
const DOMAIN_PREFIX = (PORT == "443") ? "/backend" : ""; 

const getNewCardText = async (word: string, languageMode: string, languageLevel: string, userId: string, cardId: string, timeStamp: number) => {

  console.log("start getNewCardText");
  try {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("afc_app="))
      ?.split("=")[1];
    const response = await fetch(
      `${process.env.VITE_BACKEND_DOMAIN}/generations/sentences?word=${word}&lang_mode=${languageMode}&lang_level=${languageLevel}&userId=${userId}&cardId=${cardId}&timeStamp=${timeStamp}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      },
    );
    if (!(response.ok)) {
      return {}
    }
    console.log("getNewCardText fetch successful")
    const json = await response.json();
    let cardData;
    cardData = json.choices[0].message.content; // stringified JSON
    cardData = JSON.parse(cardData);
    cardData.wordTranslated = cardData.wordTranslated.toLowerCase();
    cardData.id = cardId;
    cardData.generatingText = false;
    console.log("end getNewCardText");
    return cardData;
  } catch (e) {
    console.error(e)
    return {}
  }
  
}

const getNewCardImage = async (dispatch: Dispatch<AnyAction>, cardData: FlashCard, languageMode: string, languageLevel: string, userId: string, cardId: string, word: string) => {
    console.log("start getNewCardImage...");
    try {
      const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("afc_app="))
      ?.split("=")[1];
      cardData.generatingImage = true;
      dispatch({ type: "update-card", cardData: cardData, cardId: cardId });
      // TODO: Just have a single BACKEND DOMAIN variable that covers http(s), root domain, port, etc.
      // TODO: Update k8s config to change this at runtime
      const imageResponse = await fetch(
        `${process.env.VITE_BACKEND_DOMAIN}/generations/images?sentence=${cardData.translatedSampleSentence}&lang_mode=${languageMode}&word=${word}&cardId=${cardData.id}&userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
        },
      );
      const imageJson = await imageResponse.json();
      // 3rd fetch to persist the image in s3 then update references with persisted url
      const uploadResponse = await fetch(
        `${process.env.VITE_BACKEND_DOMAIN}/upload/image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            imgUrl: imageJson.data[0].url,
            imgName: `${cardId}-${languageMode}-${languageLevel}-${Date.now()}`,
            userId: userId
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
      console.error(e)
      return {}
    }
}

const getNewCardData = async (dispatch: Dispatch<AnyAction>, word: string, languageMode: string, languageLevel: string, userId: string, cardId: string, timeStamp: number) => {
  console.log("start getNewCardData")
  let cardData = await getNewCardText(word, languageMode, languageLevel, userId, cardId, timeStamp);
  console.log("getNewCardData cardData", cardData);
  // let promise1 = Promise.resolve(cardData);
  if (typeof(cardData.sampleSentence) == 'undefined') {
    return {}
  }
  // TODO: handle failure to generate text properly
  // promise1.then((values) => {
    console.log("getNewCardText values", cardData)
    dispatch({
    type: "update-card",
    cardId: cardId,
    cardData: cardData,
    });
  // });
  cardData = await getNewCardImage(dispatch, cardData, languageMode, languageLevel, userId, cardId, word);
  // let promise1 = Promise.resolve(cardData);
  // promise1.then((values) => {
    dispatch({
    type: "update-card",
    cardId: cardId,
    cardData: cardData,
  // });
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
        const cardData = await getNewCardData(dispatch, word, languageMode, languageLevel, userId,cardId, timeStamp);
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
      const cardData = await getNewCardData(dispatch, word, languageMode, languageLevel, userId, cardId, timeStamp)
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