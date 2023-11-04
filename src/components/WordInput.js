import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import generateCard from "../utils.js";
import Button from "react-bootstrap/esm/Button.js";

const WordInput = ({ setErrors, userId }) => {
  const languageLevel = useSelector((state) => state.languageLevel);
  const languageMode = useSelector((state) => state.languageMode);
  const [spinner, setSpinner] = useState(false);
  const cards = useSelector((state) => state.cards);
  const selectedCards = useSelector((state) => state.selectedCards);
  const dispatch = useDispatch();
  const textAreaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const wordList = textAreaRef.current.value;
    for (const [index, word] of wordList.split(",").entries()) {
      console.log(
        `WordInput.handleSubmit - \${index}:\${word.trim()}: ${index}:${word.trim()}`,
      );
      generateCard(
        dispatch,
        setSpinner,
        true,
        word,
        languageMode,
        languageLevel,
        null,
        setErrors,
        userId,
      );
    }
  };

  const handleDownload = () => {
    // TODO: upgrade download file
    let fileContents = "#separator:tab\n#html:true\n";
    const parsedCards = cards.map((card) => JSON.parse(card));
    const cardsToDownload = parsedCards.filter((card) => {
      return selectedCards.includes(card.id);
    });
    for (let card of cardsToDownload) {
      fileContents = fileContents.concat(
        `${card.word}<br>${card.sampleSentence}    <img src="${card.img}"><br>${card.translatedSampleSentence}`,
      );
    }
    console.log(fileContents);
  };

  return (
    <div className="word-input">
      <form className="word-input-form">
        <input type="text" name="card-subject" ref={textAreaRef}></input>
        <Button variant="primary" disabled={spinner} onClick={handleSubmit}>
          {" "}
          {spinner ? "Generating..." : "Generate"}
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          Download
        </Button>
        {/* {spinner && <LoadingSpinner purpose={"Generating cards"} />} */}
      </form>
    </div>
  );
};

WordInput.propTypes = {
  setErrors: PropTypes.func,
  userId: PropTypes.string,
};

export default WordInput;
