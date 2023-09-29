import React, { useRef, useState } from "react";
import PropTypes from "prop-types";

const FlashCard = ({
  cardData,
  setAllCardData,
  allCardData,
  replaceCard,
  languageLevel,
  languageMode,
}) => {
  const [regenerateCardSpinner, setRegenerateCardSpinner] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  //  const [ generateCardCount, setGenerateCardCount ] = useState(0)
  const [selected, setSelected] = useState(false);

  const wordRef = useRef(null);
  const originalRef = useRef(null);
  const translationRef = useRef(null);

  // const firstCardData = JSON.parse(JSON.stringify(cardData))

  // function stringify(obj) {
  //     let cache = [];
  //     const str = JSON.stringify(obj, function(key, value) {
  //       if (typeof value === "object" && value !== null) {
  //         if (cache.indexOf(value) !== -1) {
  //           // Circular reference found, discard key
  //           return "[Circular]";
  //         }
  //         // Store value in our collection
  //         cache.push(value);
  //       }
  //       return value;
  //     });
  //     cache = null; // reset the cache
  //     return str;
  //   }

  const handleDeletion = () => {
    setAllCardData((prev) =>
      prev.filter((prevCardData) => {
        return prevCardData.id !== cardData.id;
      }),
    );
  };

  const handleEdit = (e) => {
    if (enableEdit) {
      e.target.innerText = "Edit";
      // const newCardData = JSON.parse(JSON.stringify(cardData))
      const newCardData = { id: null, word: null, or: null, tr: null };
      newCardData.id = cardData.id;
      newCardData.word = wordRef.current.value;
      newCardData.or = originalRef.current.value;
      newCardData.tr = translationRef.current.value;
      replaceCard(cardData.id, newCardData);
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
      replaceCard(cardData.id, newCardData);
      console.log(`FlashCard.js - allCardData: ${JSON.stringify(allCardData)}`);
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
  // cardId: PropTypes.string,
  // word: PropTypes.string,
  // imgUrl: PropTypes.string,
  // originalText: PropTypes.string,
  // translatedText: PropTypes.string,
  cardData: PropTypes.object,
  setAllCardData: PropTypes.func,
  allCardData: PropTypes.arrayOf(PropTypes.object),
  replaceCard: PropTypes.func,
  languageLevel: PropTypes.string,
  languageMode: PropTypes.string,
};

export default FlashCard;
