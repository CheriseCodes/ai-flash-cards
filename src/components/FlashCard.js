import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import generateCard from "../utils.js";
import LoadingSpinner from "./LoadingSpinner.js";
import CloseButton from "react-bootstrap/esm/CloseButton.js";

const FlashCard = ({ cardData, setErrors }) => {
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
      setErrors,
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
      <div
        className={`flash-card ${
          selected ? "selected-flashcard" : "unselected-flashcard"
        }`}
      >
        {!cardData.generatingText && (
          <>
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
              <div className="image-container">
                {!cardData.generatingImage ? (
                  <img height={250} width={250} src={cardData.img}></img>
                ) : (
                  <LoadingSpinner />
                )}
              </div>
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
              <div onClick={handleDeletion}>
                <CloseButton />
              </div>
              <p onClick={handleRegenerateCard}>
                <svg
                  clipRule="evenodd"
                  fillRule="evenodd"
                  strokeLinejoin="round"
                  strokeMiterlimit="2"
                  viewBox="0 0 24 24"
                  height="24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m3.508 6.726c1.765-2.836 4.911-4.726 8.495-4.726 5.518 0 9.997 4.48 9.997 9.997 0 5.519-4.479 9.999-9.997 9.999-5.245 0-9.553-4.048-9.966-9.188-.024-.302.189-.811.749-.811.391 0 .715.3.747.69.351 4.369 4.012 7.809 8.47 7.809 4.69 0 8.497-3.808 8.497-8.499 0-4.689-3.807-8.497-8.497-8.497-3.037 0-5.704 1.597-7.206 3.995l1.991.005c.414 0 .75.336.75.75s-.336.75-.75.75h-4.033c-.414 0-.75-.336-.75-.75v-4.049c0-.414.336-.75.75-.75s.75.335.75.75z"
                    fillRule="nonzero"
                  />
                </svg>
              </p>
              <p onClick={handleEdit}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
                </svg>
              </p>
            </div>
          </>
        )}
        {cardData.generatingText && <LoadingSpinner />}
      </div>
    </>
  );
};

FlashCard.propTypes = {
  cardData: PropTypes.object,
  setErrors: PropTypes.func,
};

export default FlashCard;
