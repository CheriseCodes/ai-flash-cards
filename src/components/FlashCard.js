import React, { useRef, useState } from "react";
import PropTypes from "prop-types";

const FlashCard = ({ cardData, state, dispatch }) => {
  const [regenerateCardSpinner, setRegenerateCardSpinner] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [selected, setSelected] = useState(false);

  const wordRef = useRef(null);
  const originalRef = useRef(null);
  const translationRef = useRef(null);

  const handleDeletion = () => {
    dispatch({ type: "delete-card", payload: cardData.id });
  };

  const handleEdit = (e) => {
    if (enableEdit) {
      e.target.innerText = "Edit";
      const newCardData = { id: null, word: null, or: null, tr: null };
      newCardData.id = cardData.id;
      newCardData.word = wordRef.current.value;
      newCardData.or = originalRef.current.value;
      newCardData.tr = translationRef.current.value;
      newCardData.img = cardData.img;
      dispatch({
        type: "update-card",
        payload: { id: cardData.id, data: newCardData },
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
      const textGenUrl = `http://localhost:8000/openai/test/text?word=${currWord}&lang_mode=${state.languageMode}&lang_level=${state.languageLevel}`;

      console.log(`FlashCard.handleRegenerateCard - ${textGenUrl}`);
      const response = await fetch(textGenUrl);
      const json = await response.json();
      const generatedCardData = JSON.parse(json.choices[0].message.content);
      const imageGenUrl = `http://localhost:8000/openai/test/imagine?sentence=${generatedCardData.tr}`;
      const imageResponse = await fetch(imageGenUrl);
      const imageJson = await imageResponse.json();
      console.log(
        `newCardData JSON - ${generatedCardData.or}, ${generatedCardData.tr}`,
      );
      const newCardData = {
        id: cardData.id,
        word: currWord,
        img: imageJson.data[0].url,
        or: generatedCardData.or,
        tr: generatedCardData.tr,
      };
      console.log(
        `FlashCard.js - newCardData : ${JSON.stringify(newCardData)}`,
      );
      dispatch({
        type: "update-card",
        payload: { id: cardData.id, data: newCardData },
      });
      console.log(`FlashCard.js - allCardData: ${JSON.stringify(state.cards)}`);
      setRegenerateCardSpinner(false);
    } catch (e) {
      console.error(e);
    }
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
            defaultValue={cardData.or}
            disabled={enableEdit ? "" : "disabled"}
          ></input>
          <img src={cardData.img}></img>
          <input
            ref={translationRef}
            defaultValue={cardData.tr}
            disabled={enableEdit ? "" : "disabled"}
          ></input>
          <input
            type="checkbox"
            onChange={() => setSelected((curr) => !curr)}
          ></input>
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
  state: PropTypes.object,
  dispatch: PropTypes.func,
};

export default FlashCard;
