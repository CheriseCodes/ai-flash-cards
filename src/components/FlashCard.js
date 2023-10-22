import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import generateCard from "../utils.js";

const FlashCard = ({ cardData }) => {
  const [enableEdit, setEnableEdit] = useState(false);
  const [selected, setSelected] = useState(false);

  const wordRef = useRef(null);
  const wordTranslatedRef = useRef(null);
  const originalRef = useRef(null);
  const translationRef = useRef(null);

  const languageLevel = useSelector((state) => state.languageLevel);
  const languageMode = useSelector((state) => state.languageMode);

  const dispatch = useDispatch();

  const handleRegenerateCard = async () => {
    const currWord = wordRef.current.value;
    generateCard(
      dispatch,
      null,
      false,
      currWord,
      languageMode,
      languageLevel,
      cardData,
    );
  };

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
      {!cardData.generatingText && (
        <div
          className={`flash-card ${
            selected ? "selected-flashcard" : "unselected-flashcard"
          }`}
        >
          <div className="flash-card-content">
            <input
              ref={wordRef}
              defaultValue={cardData.word}
              disabled={enableEdit ? "" : "disabled"}
              className="flash-card-word"
            ></input>
            <textarea
              ref={originalRef}
              defaultValue={cardData.sampleSentence}
              disabled={enableEdit ? "" : "disabled"}
              className="flash-card-sentence"
            ></textarea>
            {!cardData.generatingImage ? (
              <img height={250} width={250} src={cardData.img}></img>
            ) : (
              <p>Generating image...</p>
            )}
            <input
              ref={wordTranslatedRef}
              defaultValue={cardData.wordTranslated}
              disabled={enableEdit ? "" : "disabled"}
              className="flash-card-word"
            ></input>
            <textarea
              ref={translationRef}
              defaultValue={cardData.translatedSampleSentence}
              disabled={enableEdit ? "" : "disabled"}
              className="flash-card-sentence"
            ></textarea>
          </div>
          <div className="flash-card-controls">
            <input type="checkbox" onChange={handleSelectCard}></input>

            <div onClick={handleDeletion}>X</div>
            <p onClick={handleRegenerateCard}>Regenerate</p>
            <p onClick={handleEdit}>Edit</p>
          </div>
        </div>
      )}
      {cardData.generatingText && <p>Generating...</p>}
    </>
  );
};

FlashCard.propTypes = {
  cardData: PropTypes.object,
};

export default FlashCard;
