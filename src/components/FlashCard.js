import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

const FlashCard = ({ cardData }) => {
  const [regenerateCardSpinner, setRegenerateCardSpinner] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [selected, setSelected] = useState(false);

  const wordRef = useRef(null);
  const wordTranslatedRef = useRef(null);
  const originalRef = useRef(null);
  const translationRef = useRef(null);

  const languageLevel = useSelector((state) => state.languageLevel);
  const languageMode = useSelector((state) => state.languageMode);
  const cards = useSelector((state) => state.cards);

  const dispatch = useDispatch();

  const handleDeletion = () => {
    dispatch({ type: "delete-card", cardId: cardData.id });
  };

  const handleEdit = (e) => {
    if (enableEdit) {
      e.target.innerText = "Edit";
      const newCardData = { id: null, word: null, or: null, tr: null };
      newCardData.id = cardData.id;
      newCardData.word = wordRef.current.value;
      newCardData.wordTranslated = wordTranslatedRef.current.value;
      newCardData.sampleSentence = originalRef.current.value;
      newCardData.translatedSampleSentence = translationRef.current.value;
      newCardData.img = cardData.img;
      dispatch({
        type: "update-card",
        cardId: cardData.id,
        cardData: newCardData,
      });
    } else {
      e.target.innerText = "Save Edit";
    }
    setEnableEdit((curr) => !curr);
    console.log(e);
  };

  const handleRegenerateCard = async () => {
    try {
      setRegenerateCardSpinner(true);
      const currWord = wordRef.current.value;
      const textGenUrl = `http://localhost:8000/openai/test/text?word=${currWord}&lang_mode=${languageMode}&lang_level=${languageLevel}`;

      console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`);
      const response = await fetch(textGenUrl);
      const json = await response.json();
      const generatedCardData = JSON.parse(json.choices[0].message.content);
      const imageGenUrl = `http://localhost:8000/openai/test/imagine?sentence=${generatedCardData.tr}`;
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
      console.log(
        `FlashCard.js - newCardData : ${JSON.stringify(newCardData)}`,
      );
      dispatch({
        type: "update-card",
        cardId: cardData.id,
        cardData: newCardData,
      });
      console.log(`FlashCard.js - allCardData: ${JSON.stringify(cards)}`);
      setRegenerateCardSpinner(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCard = (e) => {
    console.log("e before:", e);

    if (selected) {
      // remove from selected cards
      dispatch({
        type: "remove-selected-card",
        cardId: cardData.id,
      });
    } else {
      // add to selected cards
      dispatch({
        type: "add-selected-card",
        cardId: cardData.id,
      });
    }
    setSelected((curr) => !curr);
    console.log("e after:", e);
  };

  return (
    <>
      {!regenerateCardSpinner && (
        <div
          className={`flash-card ${
            selected ? "selected-flashcard" : "unselected-flashcard"
          }`}
        >
          <input
            ref={wordRef}
            defaultValue={cardData.word}
            disabled={enableEdit ? "" : "disabled"}
          ></input>
          <input
            ref={originalRef}
            defaultValue={cardData.sampleSentence}
            disabled={enableEdit ? "" : "disabled"}
          ></input>
          <img src={cardData.img}></img>
          <input
            ref={wordTranslatedRef}
            defaultValue={cardData.wordTranslated}
            disabled={enableEdit ? "" : "disabled"}
          ></input>
          <input
            ref={translationRef}
            defaultValue={cardData.translatedSampleSentence}
            disabled={enableEdit ? "" : "disabled"}
          ></input>
          <input type="checkbox" onChange={handleSelectCard}></input>
          <div className="controls">
            <div onClick={handleDeletion}>X</div>
            <p onClick={handleRegenerateCard}>Regenerate</p>
            <p onClick={handleEdit}>Edit</p>
          </div>
        </div>
      )}
      {regenerateCardSpinner && <p>Generating...</p>}
    </>
  );
};

FlashCard.propTypes = {
  cardData: PropTypes.object,
};

export default FlashCard;
