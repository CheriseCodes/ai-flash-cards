import React, { SetStateAction, Dispatch, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { generateNextCard  } from "../utils";
import LoadingSpinner from "./LoadingSpinner";
import { CloseButton } from "react-bootstrap";

const FlashCard = ({ cardData, setErrors, userId }: { cardData: FlashCard, setErrors: Dispatch<SetStateAction<Array<ErrorMessage>>>, userId: string}) => {
  const [enableEdit, setEnableEdit] = useState(false);
  const [selected, setSelected] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const wordRef = useRef<HTMLInputElement>(null);
  const wordTranslatedRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<HTMLTextAreaElement>(null);
  const translationRef = useRef<HTMLTextAreaElement>(null);

  const languageLevel = useSelector((state: LanguageState) => state.languageLevel);
  const languageMode = useSelector((state: LanguageState) => state.languageMode);

  const dispatch = useDispatch();

  const handleRegenerateCard = async () => {
    if (wordRef.current != null) {
      const currWord = wordRef.current.value;
      generateNextCard(
        dispatch,
        currWord,
        languageMode,
        languageLevel,
        cardData,
        setErrors,
        userId,
      );
    }
    
  };

  const handleDeletion = () => {
    dispatch({ type: "delete-card", cardId: cardData.id });
  };

  const handleEdit = (e: any) => {
    if (enableEdit && (e.target != null) && (wordRef.current != null) && (wordTranslatedRef.current != null) && (originalRef.current != null) && (translationRef.current != null)) {
      e.target.innerText = "Edit";
      const newCardData: FlashCard = { id: cardData.id, word: wordRef.current.value, wordTranslated: wordTranslatedRef.current.value, sampleSentence: originalRef.current.value, translatedSampleSentence: translationRef.current.value, img: cardData.img};
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

  const handleSelectCard = () => {
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
  };

  const reloadImage = (e: any) => {
    // TODO: if error indicates that the image was deleted (404), change the image to OOPS image
    if (reloadCount > 3) {
      console.log("Hit max reloads:", reloadCount)
      e.target.src = "https://m.media-amazon.com/images/I/418Jmnejj8L.jpg";
      e.target.hidden = false;
      setReloadCount(0);
    } else if (reloadCount > 2) {
        const windowReloads = localStorage.getItem("globalreloads");
        if (windowReloads == null) {
          const newValue: number = 1;
          localStorage.setItem("globalreloads", newValue.toString());
          window.location.reload();
        } else {
          console.log("Hit max reloads:", reloadCount)
          e.target.src = "https://m.media-amazon.com/images/I/418Jmnejj8L.jpg";
          e.target.hidden = false;
          localStorage.removeItem("globalreloads");
          setReloadCount(0);
        }
        // don't reload if hit max reloads of 30
        // setReloadCount((curr) => curr + 1);
        
    } else {
      setReloadCount((curr) => curr + 1);
      if (e.target.src.includes("?nocache")) {
        e.target.src = e.target.src.replace(/\?nocache=[0-9]/,"")
      } else {
        e.target.src = e.target.src + `?nocache=${reloadCount}`
      }
      e.target.hidden = true;
      if (!imageError) {
        setImageError((curr) => !curr);
      }
    }
  }

  const loadedImage = (e: any) => {
    e.target.hidden = false;
    if (imageError) {
      setImageError((curr) => !curr);
    }
  }
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
                disabled={!enableEdit}
                className="flash-card-word"
              ></input>
              <textarea
                ref={originalRef}
                defaultValue={cardData.sampleSentence}
                disabled={!enableEdit}
                className="flash-card-sentence"
              ></textarea>
              <div className="image-container">
                {!cardData.generatingImage ? (
                  <img height={250} width={250} src={cardData.img} crossOrigin="anonymous" alt={`Visualization of "${cardData.translatedSampleSentence}"`} onError={process.env.NODE_ENV == "development" ? () => {} : reloadImage} onLoad={loadedImage} hidden></img>
                ) : (
                  <LoadingSpinner />
                )}
                {imageError && <LoadingSpinner />}
              </div>
              <input
                ref={wordTranslatedRef}
                defaultValue={cardData.wordTranslated}
                disabled={!enableEdit}
                className="flash-card-word"
              ></input>
              <textarea
                ref={translationRef}
                defaultValue={cardData.translatedSampleSentence}
                disabled={!enableEdit}
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
  userId: PropTypes.string,
};

export default FlashCard;